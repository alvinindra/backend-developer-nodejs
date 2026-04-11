import request from "supertest"
import { describe, expect, it } from "vitest"
import { app } from "../src/app"

describe("case 17 event sourcing cqrs", () => {
  it("supports idempotent commands and projection rebuild", async () => {
    await request(app).post("/cases/17-event-sourcing-cqrs/reset")

    const open = await request(app)
      .post("/cases/17-event-sourcing-cqrs/accounts")
      .send({
        accountId: "acct-test-1",
        initialBalance: 200,
        commandId: "open-acct-test-1",
      })

    expect(open.status).toBe(201)
    expect(open.body.status).toBe("accepted")
    expect(open.body.projection.balance).toBe(200)

    const duplicateOpen = await request(app)
      .post("/cases/17-event-sourcing-cqrs/accounts")
      .send({
        accountId: "acct-test-1",
        initialBalance: 200,
        commandId: "open-acct-test-1",
      })

    expect(duplicateOpen.status).toBe(200)
    expect(duplicateOpen.body.status).toBe("duplicate_command")

    const deposit = await request(app)
      .post("/cases/17-event-sourcing-cqrs/accounts/acct-test-1/deposit")
      .send({ amount: 60, commandId: "deposit-1" })

    expect(deposit.status).toBe(201)
    expect(deposit.body.projection.balance).toBe(260)

    const duplicateDeposit = await request(app)
      .post("/cases/17-event-sourcing-cqrs/accounts/acct-test-1/deposit")
      .send({ amount: 60, commandId: "deposit-1" })

    expect(duplicateDeposit.status).toBe(200)
    expect(duplicateDeposit.body.status).toBe("duplicate_command")
    expect(duplicateDeposit.body.projection.balance).toBe(260)

    const withdraw = await request(app)
      .post("/cases/17-event-sourcing-cqrs/accounts/acct-test-1/withdraw")
      .send({ amount: 40, commandId: "withdraw-1" })

    expect(withdraw.status).toBe(201)
    expect(withdraw.body.projection.balance).toBe(220)

    const projection = await request(app).get(
      "/cases/17-event-sourcing-cqrs/accounts/acct-test-1",
    )

    expect(projection.status).toBe(200)
    expect(projection.body.projection.balance).toBe(220)
    expect(projection.body.totalEvents).toBe(3)

    const rebuild = await request(app).post(
      "/cases/17-event-sourcing-cqrs/rebuild-projections",
    )

    expect(rebuild.status).toBe(200)
    expect(rebuild.body.status).toBe("rebuilt")

    const events = await request(app).get(
      "/cases/17-event-sourcing-cqrs/events",
    )

    expect(events.status).toBe(200)
    expect(events.body.count).toBe(3)
  })
})
