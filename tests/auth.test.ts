import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app";

describe("case 07 auth", () => {
  it("creates token and accesses protected route", async () => {
    const login = await request(app).post("/cases/07-auth/login").send({
      username: "qa-user",
      role: "developer"
    });

    expect(login.status).toBe(200);
    expect(login.body.token).toBeTypeOf("string");

    const profile = await request(app)
      .get("/cases/07-auth/profile")
      .set("authorization", `Bearer ${login.body.token}`);

    expect(profile.status).toBe(200);
    expect(profile.body.profile.sub).toBe("qa-user");
  });
});
