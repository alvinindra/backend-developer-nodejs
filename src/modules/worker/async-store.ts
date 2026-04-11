import { QueryResultRow } from "pg";
import { v4 as uuidv4 } from "uuid";
import { env } from "../../config/env";
import { getPool, query } from "../db/pool";
import { log } from "../observability/logger";

export interface AsyncJob {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  attempts: number;
  maxAttempts: number;
  status: "pending" | "processing" | "completed" | "dead_letter";
  lastError: string | null;
  availableAt: string;
  createdAt: string;
  processedAt: string | null;
}

interface AsyncJobRow extends QueryResultRow {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  attempts: number;
  max_attempts: number;
  status: "pending" | "processing" | "completed" | "dead_letter";
  last_error: string | null;
  available_at: string;
  created_at: string;
  processed_at: string | null;
}

interface ServiceOrderRow extends QueryResultRow {
  id: string;
  customer_id: string;
  amount: string;
  status: "created" | "processed";
  created_at: string;
}

interface OutboxRow extends QueryResultRow {
  id: string;
  event_type: string;
  payload: Record<string, unknown>;
  published: boolean;
  created_at: string;
  published_at: string | null;
}

function mapJob(row: AsyncJobRow): AsyncJob {
  return {
    id: row.id,
    type: row.type,
    payload: row.payload,
    attempts: row.attempts,
    maxAttempts: row.max_attempts,
    status: row.status,
    lastError: row.last_error,
    availableAt: row.available_at,
    createdAt: row.created_at,
    processedAt: row.processed_at
  };
}

export async function ensureAsyncTables(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS service_orders (
      id UUID PRIMARY KEY,
      customer_id TEXT NOT NULL,
      amount NUMERIC NOT NULL,
      status TEXT NOT NULL DEFAULT 'created',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS outbox_events (
      id UUID PRIMARY KEY,
      event_type TEXT NOT NULL,
      payload JSONB NOT NULL,
      published BOOLEAN NOT NULL DEFAULT FALSE,
      published_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_outbox_pending ON outbox_events(published, created_at);

    CREATE TABLE IF NOT EXISTS async_jobs (
      id UUID PRIMARY KEY,
      type TEXT NOT NULL,
      payload JSONB NOT NULL,
      attempts INT NOT NULL DEFAULT 0,
      max_attempts INT NOT NULL DEFAULT 3,
      status TEXT NOT NULL DEFAULT 'pending',
      last_error TEXT,
      available_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      processed_at TIMESTAMPTZ
    );

    CREATE INDEX IF NOT EXISTS idx_async_jobs_pending ON async_jobs(status, available_at, created_at);
  `);
}

export async function createOrderWithOutbox(customerId: string, amount: number): Promise<{
  orderId: string;
  outboxEventId: string;
}> {
  const orderId = uuidv4();
  const outboxEventId = uuidv4();

  const client = await getPool().connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `
      INSERT INTO service_orders(id, customer_id, amount, status)
      VALUES($1, $2, $3, 'created')
      `,
      [orderId, customerId, amount]
    );

    await client.query(
      `
      INSERT INTO outbox_events(id, event_type, payload)
      VALUES($1, $2, $3::jsonb)
      `,
      [
        outboxEventId,
        "order.created",
        JSON.stringify({ id: orderId, customerId, amount, status: "created" })
      ]
    );

    await client.query("COMMIT");
    return { orderId, outboxEventId };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getOutboxState(): Promise<{
  orders: Array<{ id: string; customerId: string; amount: number; status: string; createdAt: string }>;
  outbox: Array<{
    id: string;
    eventType: string;
    payload: Record<string, unknown>;
    published: boolean;
    createdAt: string;
    publishedAt: string | null;
  }>;
}> {
  const [orderResult, outboxResult] = await Promise.all([
    query<ServiceOrderRow>(
      `
      SELECT id, customer_id, amount::text AS amount, status, created_at
      FROM service_orders
      ORDER BY created_at DESC
      LIMIT 100
      `
    ),
    query<OutboxRow>(
      `
      SELECT id, event_type, payload, published, created_at, published_at
      FROM outbox_events
      ORDER BY created_at DESC
      LIMIT 100
      `
    )
  ]);

  return {
    orders: orderResult.rows.map((row) => ({
      id: row.id,
      customerId: row.customer_id,
      amount: Number(row.amount),
      status: row.status,
      createdAt: row.created_at
    })),
    outbox: outboxResult.rows.map((row) => ({
      id: row.id,
      eventType: row.event_type,
      payload: row.payload,
      published: row.published,
      createdAt: row.created_at,
      publishedAt: row.published_at
    }))
  };
}

export async function processNextOutboxEvent(workerId: string): Promise<{
  processed: boolean;
  eventId?: string;
}> {
  const client = await getPool().connect();

  try {
    await client.query("BEGIN");

    const eventResult = await client.query<OutboxRow>(
      `
      WITH next_event AS (
        SELECT id
        FROM outbox_events
        WHERE published = FALSE
        ORDER BY created_at ASC
        FOR UPDATE SKIP LOCKED
        LIMIT 1
      )
      UPDATE outbox_events e
      SET published = TRUE, published_at = NOW()
      FROM next_event
      WHERE e.id = next_event.id
      RETURNING e.id, e.event_type, e.payload, e.published, e.created_at, e.published_at
      `
    );

    if (eventResult.rowCount === 0) {
      await client.query("COMMIT");
      return { processed: false };
    }

    const event = eventResult.rows[0];
    if (event.event_type === "order.created") {
      const orderId = String(event.payload.id ?? "");
      await client.query(
        `
        UPDATE service_orders
        SET status = 'processed'
        WHERE id = $1
        `,
        [orderId]
      );
    }

    await client.query("COMMIT");

    log("info", "outbox_event_processed", {
      workerId,
      eventId: event.id,
      eventType: event.event_type
    });

    return { processed: true, eventId: event.id };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function enqueueJob(
  type: string,
  payload: Record<string, unknown>,
  maxAttempts = 3
): Promise<AsyncJob> {
  const result = await query<AsyncJobRow>(
    `
    INSERT INTO async_jobs(id, type, payload, max_attempts, status)
    VALUES($1, $2, $3::jsonb, $4, 'pending')
    RETURNING id, type, payload, attempts, max_attempts, status, last_error, available_at, created_at, processed_at
    `,
    [uuidv4(), type, JSON.stringify(payload), maxAttempts]
  );

  return mapJob(result.rows[0]);
}

export async function processNextJob(workerId: string): Promise<{
  processed: boolean;
  job?: AsyncJob;
}> {
  const client = await getPool().connect();

  try {
    await client.query("BEGIN");

    const claimed = await client.query<AsyncJobRow>(
      `
      WITH next_job AS (
        SELECT id
        FROM async_jobs
        WHERE status = 'pending'
          AND available_at <= NOW()
        ORDER BY created_at ASC
        FOR UPDATE SKIP LOCKED
        LIMIT 1
      )
      UPDATE async_jobs j
      SET status = 'processing', attempts = attempts + 1
      FROM next_job
      WHERE j.id = next_job.id
      RETURNING j.id, j.type, j.payload, j.attempts, j.max_attempts, j.status, j.last_error, j.available_at, j.created_at, j.processed_at
      `
    );

    if (claimed.rowCount === 0) {
      await client.query("COMMIT");
      return { processed: false };
    }

    const job = claimed.rows[0];

    try {
      if (job.payload.shouldFail === true) {
        throw new Error("Simulated worker failure from payload.shouldFail");
      }

      const completed = await client.query<AsyncJobRow>(
        `
        UPDATE async_jobs
        SET status = 'completed', processed_at = NOW(), last_error = NULL
        WHERE id = $1
        RETURNING id, type, payload, attempts, max_attempts, status, last_error, available_at, created_at, processed_at
        `,
        [job.id]
      );

      await client.query("COMMIT");

      log("info", "async_job_completed", {
        workerId,
        jobId: job.id,
        type: job.type,
        attempts: job.attempts
      });

      return { processed: true, job: mapJob(completed.rows[0]) };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown processing error";
      const shouldDeadLetter = job.attempts >= job.max_attempts;

      const failed = await client.query<AsyncJobRow>(
        `
        UPDATE async_jobs
        SET
          status = $2,
          last_error = $3,
          available_at = CASE
            WHEN $2 = 'pending' THEN NOW() + ($4::int * INTERVAL '1 second')
            ELSE available_at
          END
        WHERE id = $1
        RETURNING id, type, payload, attempts, max_attempts, status, last_error, available_at, created_at, processed_at
        `,
        [job.id, shouldDeadLetter ? "dead_letter" : "pending", message, env.workerRetryDelaySeconds]
      );

      await client.query("COMMIT");

      log(shouldDeadLetter ? "error" : "warn", "async_job_failed", {
        workerId,
        jobId: job.id,
        attempts: job.attempts,
        maxAttempts: job.max_attempts,
        status: shouldDeadLetter ? "dead_letter" : "pending",
        error: message
      });

      return { processed: true, job: mapJob(failed.rows[0]) };
    }
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getJobState(): Promise<{
  pending: AsyncJob[];
  processing: AsyncJob[];
  completed: AsyncJob[];
  deadLetter: AsyncJob[];
}> {
  const result = await query<AsyncJobRow>(
    `
    SELECT id, type, payload, attempts, max_attempts, status, last_error, available_at, created_at, processed_at
    FROM async_jobs
    ORDER BY created_at DESC
    LIMIT 300
    `
  );

  const jobs = result.rows.map(mapJob);

  return {
    pending: jobs.filter((job) => job.status === "pending"),
    processing: jobs.filter((job) => job.status === "processing"),
    completed: jobs.filter((job) => job.status === "completed"),
    deadLetter: jobs.filter((job) => job.status === "dead_letter")
  };
}
