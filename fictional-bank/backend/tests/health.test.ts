import request from "supertest";
import { createApp } from "../src/app";

// NOTE: These are illustrative smoke tests. Auth/DB-dependent tests should
// point at a disposable test database (e.g. via DATABASE_URL override) and
// use Prisma migrate reset in a beforeAll hook in a full test suite.

describe("GET /api/health", () => {
  it("returns ok status", async () => {
    const app = createApp();
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.fictional).toBe(true);
  });
});

describe("POST /api/auth/login validation", () => {
  it("rejects missing credentials", async () => {
    const app = createApp();
    const res = await request(app).post("/api/auth/login").send({});
    expect(res.status).toBe(400);
  });
});
