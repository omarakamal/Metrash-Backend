const app = require("./app")
const { connectDB } = require("./config/db");

(async () => {
  await connectDB();               // connects using MONGO_URI
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Listening on ${port}`));
})();