import crypto from "crypto"
import request from "supertest"
import { describe, expect, it } from "vitest"
import { app } from "../src/app"

describe("case 15 webhook", () => {
  it("verifies valid github signature", async () => {
    const payload = { action: "push", branch: "main" }
    const body = JSON.stringify(payload)
    const secret = "webhook-dev-secret"

    const signature = `sha256=${crypto.createHmac("sha256", secret).update(body).digest("hex")}`

    const response = await request(app)
      .post("/cases/15-ci-cd-webhook/github")
      .set("content-type", "application/json")
      .set("x-github-event", "push")
      .set("x-hub-signature-256", signature)
      .send(payload)

    expect(response.status).toBe(200)
    expect(response.body.verified).toBe(true)
    expect(response.body.event).toBe("push")
  })

  it("verifies signature generated from exact raw JSON payload", async () => {
    const rawPayload =
      '{"action":"push", "branch":"main", "meta":{"a":1, "b":2}}'
    const secret = "webhook-dev-secret"

    const signature = `sha256=${crypto
      .createHmac("sha256", secret)
      .update(rawPayload)
      .digest("hex")}`

    const response = await request(app)
      .post("/cases/15-ci-cd-webhook/github")
      .set("content-type", "application/json")
      .set("x-github-event", "push")
      .set("x-hub-signature-256", signature)
      .send(rawPayload)

    expect(response.status).toBe(200)
    expect(response.body.verified).toBe(true)
  })

  it("rejects malformed signature format", async () => {
    const response = await request(app)
      .post("/cases/15-ci-cd-webhook/github")
      .set("content-type", "application/json")
      .set("x-github-event", "push")
      .set("x-hub-signature-256", "bad-signature")
      .send({ action: "push" })

    expect(response.status).toBe(400)
    expect(response.body.error).toContain("sha256=")
  })
})
