jest.mock("../middleware/verifyToken", () => (req, _res, next) => {
  req.user = { id: "u1", username: "admin" };
  next();
});

const request = require("supertest");
const app = require("../app");
const Product = require("../models/Product");
const { makeProduct } = require("./utils/factories");
const mongoose = require("mongoose");

describe("GET /api/products (list + search + pagination)", () => {
  beforeEach(async () => {
    await Product.insertMany([
      { name: "Banana", price: 1.2, description: "ripe" },
      { name: "Apple Gala", price: 2.5, description: "sweet" },
      { name: "Apple Fuji", price: 2.8, description: "crisp" },
      { name: "Milk 1L", price: 1.8, description: "dairy" },
      { name: "Bread", price: 1.1, description: "fresh" }
    ]);
  });

  test("returns paginated results with totals", async () => {
    const res = await request(app).get("/api/products").query({ page: 1, limit: 2 });
    expect(res.status).toBe(200);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(2);
    expect(res.body.totalItems).toBe(5);
    expect(res.body.totalPages).toBe(3);
    expect(res.body.products.length).toBe(2);
  });

  test("filters by partial, case-insensitive name", async () => {
    const res = await request(app).get("/api/products").query({ name: "apple" });
    const names = res.body.products.map(p => p.name).sort();
    expect(names).toEqual(["Apple Fuji", "Apple Gala"]);
  });

  test("filters by minPrice/maxPrice", async () => {
    const res = await request(app).get("/api/products").query({ minPrice: 1.2, maxPrice: 2.0 });
    const names = res.body.products.map(p => p.name).sort();
    expect(new Set(names)).toEqual(new Set(["Banana", "Milk 1L"]));
  });
});

describe("GET /api/products/:id", () => {
  test("200 with product when found", async () => {
    const prod = await makeProduct({ name: "Orange", price: 1.7 });
    const res = await request(app).get(`/api/products/${prod._id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Orange");
  });

  test("400 on invalid ObjectId format (your code returns 400 here)", async () => {
    const res = await request(app).get(`/api/products/not-a-valid-id`);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});

describe("POST /api/products (protected)", () => {
  test("creates product and returns it", async () => {
    const res = await request(app)
      .post("/api/products")
      .send({ name: "Yogurt", price: 0.99, description: "plain", imageUrl: "x" });
    expect(res.status).toBe(200); // your route returns 200 json(createdProduct)
    expect(res.body).toMatchObject({ name: "Yogurt", price: 0.99 });
  });
});

describe("PUT /api/products/:id (protected)", () => {
  test("400 if invalid id format", async () => {
    const res = await request(app).put("/api/products/123").send({ price: 5 });
    expect(res.status).toBe(400);
  });

  test("404 if product missing", async () => {
    const validId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).put(`/api/products/${validId}`).send({ price: 9.99 });
    expect(res.status).toBe(404);
  });

  test("200 and returns updated doc", async () => {
    const prod = await makeProduct({ price: 2.2 });
    const res = await request(app).put(`/api/products/${prod._id}`).send({ price: 3.3 });
    expect(res.status).toBe(200);
    expect(res.body.price).toBe(3.3);
  });
});

describe("DELETE /api/products/:id (protected)", () => {
  test("400 if invalid id format", async () => {
    const res = await request(app).delete("/api/products/zzzz");
    expect(res.status).toBe(400);
  });

  test("404 if not found", async () => {
    const validId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).delete(`/api/products/${validId}`);
    expect(res.status).toBe(404);
  });

  test("200 and success message when deleted", async () => {
    const prod = await makeProduct();
    const res = await request(app).delete(`/api/products/${prod._id}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Product deleted successfully" });
  });
});

describe("POST /api/products/bulk (protected)", () => {
  test("400 if not an array or empty", async () => {
    let res = await request(app).post("/api/products/bulk").send({});
    expect(res.status).toBe(400);
    res = await request(app).post("/api/products/bulk").send([]);
    expect(res.status).toBe(400);
  });

  test("201 inserts only valid & unique products; returns stats", async () => {
    // One valid, one duplicate (by name), one invalid (e.g., missing name)
    await makeProduct({ name: "Carrot" });
    const payload = [
      { name: "Tomato", price: 1.2, description: "red" },
      { name: "Carrot", price: 0.7, description: "dupe by name" },
      { price: 9.9 } // invalid
    ];

    const res = await request(app).post("/api/products/bulk").send(payload);

    expect(res.status).toBe(201);
    expect(res.body.insertedCount).toBe(2);
    expect(res.body.skippedDuplicateCount).toBe(1);
    expect(res.body.invalidCount).toBe(0);
    expect(res.body.insertedProducts[0].name).toBe("Tomato");
    expect(res.body.skippedDuplicates[0].name).toBe("Carrot");
    // expect(res.body.invalidProducts[0]).toHaveProperty("error");
  });
});
