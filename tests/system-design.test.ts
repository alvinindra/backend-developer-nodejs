import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app";

describe("case 14 system design", () => {
  it("returns scaling checklist", async () => {
    const response = await request(app).get("/cases/14-system-design/scaling-checklist");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.checklist)).toBe(true);
    expect(response.body.checklist.length).toBeGreaterThanOrEqual(5);
  });
});
