import { randomUUID } from "crypto"
import { Router } from "express"
import { z } from "zod"

type LedgerEventType = "account-opened" | "money-deposited" | "money-withdrawn"

interface LedgerEvent {
  sequence: number
  accountId: string
  commandId: string
  type: LedgerEventType
  amount: number
  occurredAt: string
}

interface AccountProjection {
  accountId: string
  balance: number
  version: number
  updatedAt: string
}

const openAccountSchema = z.object({
  accountId: z.string().min(2).max(64).optional(),
  initialBalance: z.number().min(0).max(1_000_000).default(0),
  commandId: z.string().min(4).max(128).optional(),
})

const amountCommandSchema = z.object({
  amount: z.number().positive().max(1_000_000),
  commandId: z.string().min(4).max(128).optional(),
})

let nextSequence = 1
const eventStore: LedgerEvent[] = []
const commandResultById = new Map<
  string,
  { sequence: number; accountId: string }
>()
const accountProjectionStore = new Map<string, AccountProjection>()

function getIsoNow(): string {
  return new Date().toISOString()
}

function ensureAccount(accountId: string): AccountProjection {
  const account = accountProjectionStore.get(accountId)
  if (!account) {
    throw new Error("account_not_found")
  }

  return account
}

function applyEvent(
  target: Map<string, AccountProjection>,
  event: LedgerEvent,
): void {
  if (event.type === "account-opened") {
    target.set(event.accountId, {
      accountId: event.accountId,
      balance: event.amount,
      version: event.sequence,
      updatedAt: event.occurredAt,
    })
    return
  }

  const existing = target.get(event.accountId)

  if (!existing) {
    throw new Error("projection_missing_account")
  }

  const delta = event.type === "money-withdrawn" ? -event.amount : event.amount
  const nextBalance = existing.balance + delta

  if (nextBalance < 0) {
    throw new Error("insufficient_balance")
  }

  target.set(event.accountId, {
    accountId: event.accountId,
    balance: nextBalance,
    version: event.sequence,
    updatedAt: event.occurredAt,
  })
}

function appendEvent(input: {
  accountId: string
  commandId: string
  type: LedgerEventType
  amount: number
}): LedgerEvent {
  const event: LedgerEvent = {
    sequence: nextSequence,
    accountId: input.accountId,
    commandId: input.commandId,
    type: input.type,
    amount: input.amount,
    occurredAt: getIsoNow(),
  }

  applyEvent(accountProjectionStore, event)
  eventStore.push(event)
  commandResultById.set(input.commandId, {
    sequence: event.sequence,
    accountId: input.accountId,
  })
  nextSequence += 1
  return event
}

function duplicateCommand(
  commandId: string,
): { sequence: number; accountId: string } | undefined {
  return commandResultById.get(commandId)
}

function makeCommandId(providedId?: string): string {
  return providedId?.trim() || randomUUID()
}

export const case17EventSourcingCqrsRouter = Router()

case17EventSourcingCqrsRouter.post("/accounts", (req, res) => {
  const parsed = openAccountSchema.safeParse(req.body ?? {})

  if (!parsed.success) {
    res.status(400).json({
      case: "17-event-sourcing-cqrs",
      error: parsed.error.flatten(),
    })
    return
  }

  const accountId =
    parsed.data.accountId?.trim() || `acct-${randomUUID().slice(0, 8)}`
  const commandId = makeCommandId(parsed.data.commandId)

  const duplicate = duplicateCommand(commandId)
  if (duplicate) {
    const projection = accountProjectionStore.get(duplicate.accountId) ?? null
    res.status(200).json({
      case: "17-event-sourcing-cqrs",
      status: "duplicate_command",
      commandId,
      eventSequence: duplicate.sequence,
      projection,
    })
    return
  }

  if (accountProjectionStore.has(accountId)) {
    res.status(409).json({
      case: "17-event-sourcing-cqrs",
      error: `account already exists: ${accountId}`,
    })
    return
  }

  const event = appendEvent({
    accountId,
    commandId,
    type: "account-opened",
    amount: parsed.data.initialBalance,
  })

  res.status(201).json({
    case: "17-event-sourcing-cqrs",
    status: "accepted",
    event,
    projection: accountProjectionStore.get(accountId),
  })
})

case17EventSourcingCqrsRouter.post(
  "/accounts/:accountId/deposit",
  (req, res) => {
    const parsed = amountCommandSchema.safeParse(req.body ?? {})

    if (!parsed.success) {
      res.status(400).json({
        case: "17-event-sourcing-cqrs",
        error: parsed.error.flatten(),
      })
      return
    }

    const accountId = String(req.params.accountId)
    const commandId = makeCommandId(parsed.data.commandId)

    const duplicate = duplicateCommand(commandId)
    if (duplicate) {
      const projection = accountProjectionStore.get(duplicate.accountId) ?? null
      res.status(200).json({
        case: "17-event-sourcing-cqrs",
        status: "duplicate_command",
        commandId,
        eventSequence: duplicate.sequence,
        projection,
      })
      return
    }

    try {
      ensureAccount(accountId)
    } catch {
      res.status(404).json({
        case: "17-event-sourcing-cqrs",
        error: `account not found: ${accountId}`,
      })
      return
    }

    const event = appendEvent({
      accountId,
      commandId,
      type: "money-deposited",
      amount: parsed.data.amount,
    })

    res.status(201).json({
      case: "17-event-sourcing-cqrs",
      status: "accepted",
      event,
      projection: accountProjectionStore.get(accountId),
    })
  },
)

case17EventSourcingCqrsRouter.post(
  "/accounts/:accountId/withdraw",
  (req, res) => {
    const parsed = amountCommandSchema.safeParse(req.body ?? {})

    if (!parsed.success) {
      res.status(400).json({
        case: "17-event-sourcing-cqrs",
        error: parsed.error.flatten(),
      })
      return
    }

    const accountId = String(req.params.accountId)
    const commandId = makeCommandId(parsed.data.commandId)

    const duplicate = duplicateCommand(commandId)
    if (duplicate) {
      const projection = accountProjectionStore.get(duplicate.accountId) ?? null
      res.status(200).json({
        case: "17-event-sourcing-cqrs",
        status: "duplicate_command",
        commandId,
        eventSequence: duplicate.sequence,
        projection,
      })
      return
    }

    const current = accountProjectionStore.get(accountId)
    if (!current) {
      res.status(404).json({
        case: "17-event-sourcing-cqrs",
        error: `account not found: ${accountId}`,
      })
      return
    }

    if (current.balance < parsed.data.amount) {
      res.status(409).json({
        case: "17-event-sourcing-cqrs",
        error: "insufficient balance",
        projection: current,
      })
      return
    }

    const event = appendEvent({
      accountId,
      commandId,
      type: "money-withdrawn",
      amount: parsed.data.amount,
    })

    res.status(201).json({
      case: "17-event-sourcing-cqrs",
      status: "accepted",
      event,
      projection: accountProjectionStore.get(accountId),
    })
  },
)

case17EventSourcingCqrsRouter.get("/accounts/:accountId", (req, res) => {
  const accountId = String(req.params.accountId)
  const projection = accountProjectionStore.get(accountId)

  if (!projection) {
    res.status(404).json({
      case: "17-event-sourcing-cqrs",
      error: `account not found: ${accountId}`,
    })
    return
  }

  const totalEvents = eventStore.filter(
    (event) => event.accountId === accountId,
  ).length

  res.json({
    case: "17-event-sourcing-cqrs",
    projection,
    totalEvents,
  })
})

case17EventSourcingCqrsRouter.get("/events", (req, res) => {
  const accountId = req.query.accountId
    ? String(req.query.accountId)
    : undefined
  const data = accountId
    ? eventStore.filter((event) => event.accountId === accountId)
    : eventStore

  res.json({
    case: "17-event-sourcing-cqrs",
    count: data.length,
    data,
  })
})

case17EventSourcingCqrsRouter.post("/rebuild-projections", (_req, res) => {
  const rebuilt = new Map<string, AccountProjection>()

  for (const event of eventStore) {
    applyEvent(rebuilt, event)
  }

  accountProjectionStore.clear()
  for (const [accountId, projection] of rebuilt.entries()) {
    accountProjectionStore.set(accountId, projection)
  }

  res.json({
    case: "17-event-sourcing-cqrs",
    status: "rebuilt",
    accounts: accountProjectionStore.size,
    events: eventStore.length,
  })
})

case17EventSourcingCqrsRouter.post("/reset", (_req, res) => {
  nextSequence = 1
  eventStore.length = 0
  commandResultById.clear()
  accountProjectionStore.clear()

  res.json({
    case: "17-event-sourcing-cqrs",
    status: "reset",
    message: "Event store, command registry, and projections cleared",
  })
})
