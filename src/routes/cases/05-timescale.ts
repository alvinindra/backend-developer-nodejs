import { Router } from "express";
import { query } from "../../modules/db/pool";
import { z } from "zod";

const metricSchema = z.object({
  service: z.string().min(2),
  value: z.number()
});

export const case05TimescaleRouter = Router();

case05TimescaleRouter.post("/setup", async (_req, res) => {
  try {
    await query("CREATE EXTENSION IF NOT EXISTS timescaledb;");
    await query(`
      CREATE TABLE IF NOT EXISTS service_metrics (
        time TIMESTAMPTZ NOT NULL,
        service TEXT NOT NULL,
        value DOUBLE PRECISION NOT NULL
      );
    `);
    await query(
      "SELECT create_hypertable('service_metrics', by_range('time'), if_not_exists => TRUE);"
    );

    res.json({ case: "05-timescale", message: "hypertable ready" });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Timescale setup failed" });
  }
});

case05TimescaleRouter.post("/metrics", async (req, res) => {
  const parsed = metricSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    await query("INSERT INTO service_metrics(time, service, value) VALUES (NOW(), $1, $2)", [
      parsed.data.service,
      parsed.data.value
    ]);

    res.status(201).json({ case: "05-timescale", ingested: parsed.data });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Insert metric failed" });
  }
});

case05TimescaleRouter.get("/query", async (req, res) => {
  const service = String(req.query.service ?? "api");
  const minutes = Number(req.query.minutes ?? 60);

  try {
    const result = await query<{ bucket: string; avg_value: number }>(
      `
        SELECT
          time_bucket('5 minutes', time) AS bucket,
          AVG(value) AS avg_value
        FROM service_metrics
        WHERE service = $1 AND time >= NOW() - ($2::text || ' minutes')::interval
        GROUP BY bucket
        ORDER BY bucket DESC
        LIMIT 24;
      `,
      [service, minutes]
    );

    res.json({ case: "05-timescale", service, minutes, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Timescale query failed" });
  }
});
