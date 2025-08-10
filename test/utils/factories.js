const bcrypt = require("bcrypt");
const User = require("../../models/User");
const Product = require("../../models/Product");

async function makeUser(attrs = {}) {
  const user = await User.create({
    username: attrs.username || `user_${Date.now()}`,
    hashedPassword: bcrypt.hashSync(attrs.password || "Password!23", 12),
  });
  return user;
}

async function makeProduct(attrs = {}) {
  return Product.create({
    name: attrs.name ?? `Apple ${Math.random().toString(36).slice(2,7)}`,
    price: attrs.price ?? 3.5,
    description: attrs.description ?? "Fresh and crispy",
    imageUrl: attrs.imageUrl ?? "https://example.com/apple.jpg"
  });
}

module.exports = { makeUser, makeProduct };
