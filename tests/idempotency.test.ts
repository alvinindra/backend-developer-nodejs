import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app";

describe("case 09b idempotency", () => {
  it("returns duplicate on repeated idempotency key", async () => {
    const key = "fixed-key-1";

    const first = await request(app)
      .post("/cases/09b-idempotency/payment")
      .set("idempotency-key", key)
      .send({ amount: 120, currency: "USD" });

    expect(first.status).toBe(201);
    expect(first.body.status).toBe("processed");

    const second = await request(app)
      .post("/cases/09b-idempotency/payment")
      .set("idempotency-key", key)
      .send({ amount: 120, currency: "USD" });

    expect(second.status).toBe(200);
    expect(second.body.status).toBe("duplicate");
  });
});
