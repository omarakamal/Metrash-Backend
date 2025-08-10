const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");
const { makeUser } = require("./utils/factories");

describe("Auth routes", () => {
  test("POST /api/auth/login -> 401 if user not found", async () => {
    const res = await request(app).post("/api/auth/login").send({
      username: "ghost",
      password: "nope"
    });
    expect(res.status).toBe(401);
    expect(res.body.err).toMatch(/not signed up/i);
  });

  test("POST /api/auth/login -> 401 if bad password", async () => {
    await makeUser({ username: "alice", password: "Correct#123" });
    const res = await request(app).post("/api/auth/login").send({
      username: "alice",
      password: "WrongPass"
    });
    expect(res.status).toBe(401);
    expect(res.body.err).toMatch(/incorrect/i);
  });

  test("POST /api/auth/login -> 200 + token on success", async () => {
    await makeUser({ username: "bob", password: "Correct#123" });

    const res = await request(app).post("/api/auth/login").send({
      username: "bob",
      password: "Correct#123"
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
    expect(decoded).toHaveProperty("payload.username", "bob");
  });

  test("GET /api/auth/verify -> returns user when token valid", async () => {
    // make a token that matches your route’s shape: { payload: <user> }
    const token = jwt.sign({ payload: { id: "123", username: "bob" } }, process.env.JWT_SECRET, { expiresIn: "30m" });

    const res = await request(app)
      .get("/api/auth/verify")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: "123", username: "bob" });
  });
});
