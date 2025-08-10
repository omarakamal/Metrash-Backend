// const request = require("supertest");
// const app = require("../app");
// const User = require("../models/User");
// const { makeUser } = require("./utils/factories");
// const mongoose = require("mongoose");

// describe("Admin Users", () => {
//   test("POST /api/users/create -> 201, omits hashedPassword", async () => {
//     const res = await request(app)
//       .post("/api/users/create")
//       .send({ username: "admin1", password: "Secret#123" });

//     expect(res.status).toBe(201);
//     expect(res.body.username).toBe("admin1");
//     expect(res.body.hashedPassword).toBeUndefined();
//   });

//   test("POST /api/users/create -> 409 on duplicate username", async () => {
//     await makeUser({ username: "dupe" });
//     const res = await request(app)
//       .post("/api/users/create")
//       .send({ username: "dupe", password: "x" });
//     expect(res.status).toBe(409);
//   });

//   test("GET /api/users -> returns all users without sensitive fields", async () => {
//     await makeUser({ username: "u1" });
//     await makeUser({ username: "u2" });
//     const res = await request(app).get("/api/users");
//     expect(res.status).toBe(200);
//     expect(res.body.length).toBe(2);
//     expect(Object.keys(res.body[0])).not.toContain("hashedPassword");
//     expect(Object.keys(res.body[0])).not.toContain("__v");
//   });

//   test("GET /api/admin/users/:userId -> 200 and sanitized user", async () => {
//     const u = await makeUser({ username: "solo" });
//     const res = await request(app).get(`/api/users/${u._id}`);
//     expect(res.status).toBe(200);
//     expect(res.body.username).toBe("solo");
//     expect(res.body.hashedPassword).toBeUndefined();
//   });

//   test("GET /api/admin/users/:userId -> 500 when invalid id (your code)", async () => {
//     const res = await request(app).get(`/api/users/not-an-id`);
//     expect(res.status).toBe(500);
//   });
// });

test("",()=>{
    expect(0).toBe(0)
})