import { env } from "./config/env"
import { closePool } from "./modules/db/pool"
import {
  ensureAsyncTables,
  processNextJob,
  processNextOutboxEvent,
} from "./modules/worker/async-store"
import { log } from "./modules/observability/logger"

let isRunning = false
let workerInterval: ReturnType<typeof setInterval> | null = null
let isShuttingDown = false

async function pollOnce(): Promise<void> {
  if (isRunning) {
    return
  }

  isRunning = true

  try {
    const [jobResult, outboxResult] = await Promise.all([
      processNextJob(env.workerId),
      processNextOutboxEvent(env.workerId),
    ])

    if (jobResult.processed || outboxResult.processed) {
      log("info", "worker_tick_processed", {
        workerId: env.workerId,
        processedJob: jobResult.processed,
        processedOutbox: outboxResult.processed,
        jobId: jobResult.job?.id,
        outboxEventId: outboxResult.eventId,
      })
    }
  } catch (error) {
    log("error", "worker_tick_failed", {
      workerId: env.workerId,
      error: error instanceof Error ? error.message : "Unknown worker error",
    })
  } finally {
    isRunning = false
  }
}

async function startWorker(): Promise<void> {
  await ensureAsyncTables()

  log("info", "worker_started", {
    workerId: env.workerId,
    pollIntervalMs: env.workerPollIntervalMs,
  })

  await pollOnce()
  workerInterval = setInterval(() => {
    void pollOnce()
  }, env.workerPollIntervalMs)
}

async function waitForCurrentPoll(maxWaitMs = 5_000): Promise<void> {
  const startedAt = Date.now()

  while (isRunning && Date.now() - startedAt < maxWaitMs) {
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
}

async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) {
    return
  }

  isShuttingDown = true
  log("warn", "worker_shutdown_started", { signal, workerId: env.workerId })

  if (workerInterval) {
    clearInterval(workerInterval)
    workerInterval = null
  }

  try {
    await waitForCurrentPoll()
    await closePool()
    log("info", "worker_shutdown_completed", { signal, workerId: env.workerId })
    process.exit(0)
  } catch (error) {
    log("error", "worker_shutdown_failed", {
      signal,
      workerId: env.workerId,
      error:
        error instanceof Error
          ? error.message
          : "Unknown worker shutdown error",
    })
    process.exit(1)
  }
}

process.on("SIGINT", () => {
  void shutdown("SIGINT")
})

process.on("SIGTERM", () => {
  void shutdown("SIGTERM")
})

process.on("unhandledRejection", (reason) => {
  log("error", "worker_unhandled_rejection", {
    reason: reason instanceof Error ? reason.message : String(reason),
  })
})

process.on("uncaughtException", (error) => {
  log("error", "worker_uncaught_exception", {
    error: error.message,
  })
  void shutdown("uncaughtException")
})

void startWorker()
