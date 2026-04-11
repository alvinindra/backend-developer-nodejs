import request from "supertest"
import { describe, expect, it } from "vitest"
import { app } from "../src/app"

describe("openapi docs", () => {
  it("serves stoplight UI and the OpenAPI YAML spec", async () => {
    const uiResponse = await request(app).get("/docs/openapi")
    expect(uiResponse.status).toBe(200)
    expect(uiResponse.headers["content-type"]).toContain("text/html")
    expect(uiResponse.text).toContain("<elements-api")

    const specResponse = await request(app).get("/docs/openapi.yaml")
    expect(specResponse.status).toBe(200)
    expect(specResponse.headers["content-type"]).toContain("application/yaml")
    expect(specResponse.text).toContain("openapi: 3.0.3")
    expect(specResponse.text).toContain("/cases/17-event-sourcing-cqrs/reset")
  })
})
