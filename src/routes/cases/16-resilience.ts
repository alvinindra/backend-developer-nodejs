import { Router } from "express"
import { z } from "zod"

type CircuitStatus = "closed" | "open" | "half-open"
type Scenario = "success" | "fail" | "timeout" | "flaky"

interface CircuitState {
  dependency: string
  status: CircuitStatus
  consecutiveFailures: number
  openedAtMs: number | null
  inflight: number
  calls: number
  successes: number
  failures: number
  timeouts: number
  rejected: number
  lastError: string | null
  updatedAt: string
}

const policy = {
  maxAttempts: 3,
  timeoutMs: 180,
  failureThreshold: 3,
  openWindowMs: 8_000,
  bulkheadLimit: 4,
} as const

const invokeSchema = z.object({
  dependency: z.string().min(2).max(64).default("payment-gateway"),
  scenario: z.enum(["success", "fail", "timeout", "flaky"]).default("success"),
  timeoutMs: z.number().int().min(60).max(3_000).optional(),
})

const circuitStore = new Map<string, CircuitState>()

function nowIso(): string {
  return new Date().toISOString()
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getCircuit(dependency: string): CircuitState {
  const existing = circuitStore.get(dependency)
  if (existing) {
    return existing
  }

  const initial: CircuitState = {
    dependency,
    status: "closed",
    consecutiveFailures: 0,
    openedAtMs: null,
    inflight: 0,
    calls: 0,
    successes: 0,
    failures: 0,
    timeouts: 0,
    rejected: 0,
    lastError: null,
    updatedAt: nowIso(),
  }

  circuitStore.set(dependency, initial)
  return initial
}

function canPassCircuit(circuit: CircuitState): {
  allowed: boolean
  retryAfterMs?: number
} {
  if (circuit.status !== "open") {
    return { allowed: true }
  }

  const openedAtMs = circuit.openedAtMs ?? Date.now()
  const elapsedMs = Date.now() - openedAtMs

  if (elapsedMs >= policy.openWindowMs) {
    circuit.status = "half-open"
    circuit.updatedAt = nowIso()
    return { allowed: true }
  }

  return {
    allowed: false,
    retryAfterMs: Math.max(policy.openWindowMs - elapsedMs, 0),
  }
}

async function runDownstreamScenario(
  dependency: string,
  scenario: Scenario,
  attempt: number,
  timeoutMs: number,
): Promise<{
  dependency: string
  scenario: Scenario
  attempt: number
  ok: true
}> {
  if (scenario === "timeout") {
    await delay(timeoutMs + 90)
    return { dependency, scenario, attempt, ok: true }
  }

  if (scenario === "fail") {
    await delay(35)
    throw new Error("downstream_failure")
  }

  if (scenario === "flaky" && attempt === 1) {
    await delay(20)
    throw new Error("transient_downstream_failure")
  }

  await delay(24)
  return { dependency, scenario, attempt, ok: true }
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T> {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error("request_timeout"))
    }, timeoutMs)
  })

  try {
    return await Promise.race([promise, timeoutPromise])
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle)
    }
  }
}

function markSuccess(circuit: CircuitState): void {
  circuit.successes += 1
  circuit.calls += 1
  circuit.consecutiveFailures = 0
  circuit.status = "closed"
  circuit.openedAtMs = null
  circuit.lastError = null
  circuit.updatedAt = nowIso()
}

function markFailure(
  circuit: CircuitState,
  errorMessage: string,
  timedOut: boolean,
): void {
  circuit.failures += 1
  circuit.calls += 1
  circuit.consecutiveFailures += 1

  if (timedOut) {
    circuit.timeouts += 1
  }

  circuit.lastError = errorMessage

  if (circuit.consecutiveFailures >= policy.failureThreshold) {
    circuit.status = "open"
    circuit.openedAtMs = Date.now()
  }

  circuit.updatedAt = nowIso()
}

export const case16ResilienceRouter = Router()

case16ResilienceRouter.post("/invoke", async (req, res) => {
  const parsed = invokeSchema.safeParse(req.body ?? {})

  if (!parsed.success) {
    res.status(400).json({
      error: parsed.error.flatten(),
      case: "16-resilience",
    })
    return
  }

  const dependency = parsed.data.dependency
  const scenario = parsed.data.scenario
  const timeoutMs = parsed.data.timeoutMs ?? policy.timeoutMs
  const circuit = getCircuit(dependency)

  const passCircuit = canPassCircuit(circuit)
  if (!passCircuit.allowed) {
    circuit.rejected += 1
    circuit.updatedAt = nowIso()
    res.status(503).json({
      case: "16-resilience",
      dependency,
      status: "rejected_by_circuit",
      circuit,
      retryAfterMs: passCircuit.retryAfterMs,
      policy,
    })
    return
  }

  if (circuit.inflight >= policy.bulkheadLimit) {
    circuit.rejected += 1
    circuit.updatedAt = nowIso()
    res.status(429).json({
      case: "16-resilience",
      dependency,
      status: "rejected_by_bulkhead",
      circuit,
      policy,
    })
    return
  }

  const startedAtMs = Date.now()
  circuit.inflight += 1

  try {
    let lastError = "unknown_failure"

    for (let attempt = 1; attempt <= policy.maxAttempts; attempt += 1) {
      try {
        const result = await withTimeout(
          runDownstreamScenario(dependency, scenario, attempt, timeoutMs),
          timeoutMs,
        )

        markSuccess(circuit)

        res.json({
          case: "16-resilience",
          dependency,
          scenario,
          attemptsUsed: attempt,
          elapsedMs: Date.now() - startedAtMs,
          status: "success",
          result,
          circuit,
          policy,
        })
        return
      } catch (error) {
        lastError = error instanceof Error ? error.message : "unknown_failure"

        if (attempt === policy.maxAttempts) {
          const timedOut = lastError === "request_timeout"
          markFailure(circuit, lastError, timedOut)
          res.status(timedOut ? 504 : 502).json({
            case: "16-resilience",
            dependency,
            scenario,
            attemptsUsed: attempt,
            elapsedMs: Date.now() - startedAtMs,
            status: "failed_after_retries",
            error: lastError,
            circuit,
            policy,
          })
          return
        }
      }
    }
  } finally {
    circuit.inflight = Math.max(circuit.inflight - 1, 0)
    circuit.updatedAt = nowIso()
  }
})

case16ResilienceRouter.get("/state", (_req, res) => {
  res.json({
    case: "16-resilience",
    policy,
    circuits: Array.from(circuitStore.values()),
  })
})

case16ResilienceRouter.post("/reset", (_req, res) => {
  circuitStore.clear()
  res.json({
    case: "16-resilience",
    status: "reset",
    message: "Circuit and metrics state cleared",
  })
})
