import request from "supertest"
import { describe, expect, it } from "vitest"
import { app } from "../src/app"

describe("case 16 resilience", () => {
  it("executes a successful downstream call and returns state", async () => {
    await request(app).post("/cases/16-resilience/reset")

    const invoke = await request(app)
      .post("/cases/16-resilience/invoke")
      .send({ dependency: "payments", scenario: "success", timeoutMs: 200 })

    expect(invoke.status).toBe(200)
    expect(invoke.body.case).toBe("16-resilience")
    expect(invoke.body.status).toBe("success")

    const state = await request(app).get("/cases/16-resilience/state")

    expect(state.status).toBe(200)
    const circuit = state.body.circuits.find(
      (entry: { dependency: string }) => entry.dependency === "payments",
    )
    expect(circuit).toBeTruthy()
    expect(circuit.status).toBe("closed")
    expect(circuit.successes).toBeGreaterThanOrEqual(1)
  })

  it("opens the circuit after repeated failures and rejects subsequent traffic", async () => {
    await request(app).post("/cases/16-resilience/reset")

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const failed = await request(app)
        .post("/cases/16-resilience/invoke")
        .send({ dependency: "billing", scenario: "fail", timeoutMs: 120 })

      expect(failed.status).toBe(502)
      expect(failed.body.status).toBe("failed_after_retries")
    }

    const rejected = await request(app)
      .post("/cases/16-resilience/invoke")
      .send({ dependency: "billing", scenario: "success", timeoutMs: 120 })

    expect(rejected.status).toBe(503)
    expect(rejected.body.status).toBe("rejected_by_circuit")

    const state = await request(app).get("/cases/16-resilience/state")
    const billingCircuit = state.body.circuits.find(
      (entry: { dependency: string }) => entry.dependency === "billing",
    )

    expect(billingCircuit).toBeTruthy()
    expect(billingCircuit.status).toBe("open")
    expect(billingCircuit.rejected).toBeGreaterThanOrEqual(1)
  })
})
