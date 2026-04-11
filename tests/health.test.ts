import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app";

describe("case 01 health", () => {
  it("returns ok payload", async () => {
    const response = await request(app).get("/cases/01-health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.case).toBe("01-health");
  });
});
