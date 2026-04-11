import { app } from "./app"
import { env } from "./config/env"
import { closePool } from "./modules/db/pool"
import { log } from "./modules/observability/logger"

const server = app.listen(env.port, () => {
  log("info", "server_started", {
    port: env.port,
    nodeEnv: env.nodeEnv,
  })
})

let isShuttingDown = false

async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) {
    return
  }

  isShuttingDown = true
  log("warn", "server_shutdown_started", { signal })

  const forceExitTimer = setTimeout(() => {
    log("error", "server_shutdown_forced", { signal })
    process.exit(1)
  }, 10_000)
  forceExitTimer.unref()

  server.close(async (error) => {
    try {
      await closePool()
    } catch (poolError) {
      log("error", "server_pool_close_failed", {
        error:
          poolError instanceof Error
            ? poolError.message
            : "Unknown pool close failure",
      })
    }

    clearTimeout(forceExitTimer)

    if (error) {
      log("error", "server_shutdown_failed", {
        signal,
        error: error.message,
      })
      process.exit(1)
      return
    }

    log("info", "server_shutdown_completed", { signal })
    process.exit(0)
  })
}

process.on("SIGINT", () => {
  void shutdown("SIGINT")
})

process.on("SIGTERM", () => {
  void shutdown("SIGTERM")
})

process.on("unhandledRejection", (reason) => {
  log("error", "server_unhandled_rejection", {
    reason: reason instanceof Error ? reason.message : String(reason),
  })
})

process.on("uncaughtException", (error) => {
  log("error", "server_uncaught_exception", {
    error: error.message,
  })
  void shutdown("uncaughtException")
})
