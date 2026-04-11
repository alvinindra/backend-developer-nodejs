import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app";

describe("case 13 cicd gcp", () => {
  it("returns pipeline and cloud run info", async () => {
    const response = await request(app).get("/cases/13-cicd-gcp");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.pipelines)).toBe(true);
    expect(response.body.pipelines.length).toBeGreaterThanOrEqual(3);
    expect(response.body.gcpTargets.runService).toBe("backend-developer-lab");
  });
});
