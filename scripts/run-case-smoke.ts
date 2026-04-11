import { env } from "../src/config/env"

interface CheckResult {
  route: string
  ok: boolean
  status?: number
  error?: string
}

const baseUrl = `http://localhost:${env.port}`

const smokeRoutes = [
  "/cases/01-health",
  "/cases/04b-postgres-transactions/balances",
  "/cases/08b-service-boundary/inventory",
  "/cases/09b-idempotency/store",
  "/cases/12-observability",
  "/cases/13-cicd-gcp",
  "/cases/14-system-design/scaling-checklist",
  "/cases/16-resilience/state",
  "/cases/17-event-sourcing-cqrs/events",
]

async function run(): Promise<void> {
  const results: CheckResult[] = []

  for (const route of smokeRoutes) {
    try {
      const response = await fetch(`${baseUrl}${route}`)
      results.push({ route, ok: response.ok, status: response.status })
    } catch (error) {
      results.push({
        route,
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  const failed = results.filter((result) => !result.ok)

  console.log(JSON.stringify({ baseUrl, results }, null, 2))

  if (failed.length > 0) {
    process.exitCode = 1
  }
}

run()
