const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const { connectDB, disconnectDB } = require("../../config/db");

let mongo;

beforeAll(async () => {
  // spin up in‑memory Mongo
  mongo = await MongoMemoryServer.create();

  // connect *through your helper* so the rest of the app uses the same singleton
  await connectDB(mongo.getUri());

  // test secrets
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
  process.env.NODE_ENV = "test";
});

afterEach(async () => {
  // clean all collections between tests
  if (mongoose.connection?.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key of Object.keys(collections)) {
      await collections[key].deleteMany({});
    }
  }
});

afterAll(async () => {
  // IMPORTANT: close mongoose FIRST, then stop the memory server
  await disconnectDB();
  if (mongo) await mongo.stop();
});
