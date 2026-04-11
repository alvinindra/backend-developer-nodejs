import { Router } from "express";
import { env } from "../../config/env";
import { enqueueJob, ensureAsyncTables, getJobState, processNextJob } from "../../modules/worker/async-store";

export const case09QueueWorkerRouter = Router();

case09QueueWorkerRouter.post("/setup", async (_req, res) => {
  try {
    await ensureAsyncTables();
    res.json({ case: "09-queue-worker", message: "async_jobs table ready" });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Setup failed" });
  }
});

case09QueueWorkerRouter.post("/enqueue", async (req, res) => {
  const type = String(req.body.type ?? "send-email");
  const payload = (req.body.payload ?? {}) as Record<string, unknown>;
  const maxAttempts = Number(req.body.maxAttempts ?? 3);

  try {
    const job = await enqueueJob(type, payload, maxAttempts);
    res.status(201).json({ case: "09-queue-worker", job });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Enqueue failed" });
  }
});

case09QueueWorkerRouter.post("/process", async (_req, res) => {
  try {
    const processed = await processNextJob(env.workerId);

    if (!processed.processed) {
      res.json({ case: "09-queue-worker", message: "No pending jobs" });
      return;
    }

    res.json({ case: "09-queue-worker", processed: processed.job });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Process failed" });
  }
});

case09QueueWorkerRouter.get("/stats", async (_req, res) => {
  try {
    const state = await getJobState();
    res.json({ case: "09-queue-worker", ...state });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Stats query failed" });
  }
});
