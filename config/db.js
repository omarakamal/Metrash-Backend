const mongoose = require("mongoose");

let currentUri = null;

async function connectDB(uri) {
  const target = uri || process.env.MONGO_URI;
  if (!target) throw new Error("MONGO_URI not set (and no URI passed to connectDB)");

  // If already connected to the same URI, do nothing
  if (mongoose.connection.readyState === 1 && currentUri === target) return;

  // If connected to a different URI (e.g., dev DB), disconnect first
  if (mongoose.connection.readyState === 1 && currentUri && currentUri !== target) {
    await mongoose.disconnect();
  }

  await mongoose.connect(target, { dbName: "testdb" }); // dbName optional for Atlas URIs
  currentUri = target;
}

async function disconnectDB() {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  } catch (err) {
    // Swallow "Topology is closed" during test teardown
    if (!(err && /Topology is closed/i.test(String(err.message)))) {
      throw err;
    }
  } finally {
    currentUri = null;
  }
}

module.exports = { connectDB, disconnectDB };
