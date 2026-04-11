import request from "supertest"
import { describe, expect, it } from "vitest"
import { app } from "../src/app"

describe("study case registry", () => {
  it("returns documented list with all advanced cases", async () => {
    const response = await request(app).get("/docs/study-cases")

    expect(response.status).toBe(200)
    expect(Array.isArray(response.body.details)).toBe(true)
    expect(response.body.details.length).toBeGreaterThanOrEqual(20)
    expect(response.body.routes).toContain("/cases/15-ci-cd-webhook")
    expect(response.body.routes).toContain("/cases/04b-postgres-transactions")
    expect(response.body.routes).toContain("/cases/08b-service-boundary")
    expect(response.body.routes).toContain("/cases/09b-idempotency")
    expect(response.body.routes).toContain("/cases/16-resilience")
    expect(response.body.routes).toContain("/cases/17-event-sourcing-cqrs")
  })
})
