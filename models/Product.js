const {Schema, model} = require("mongoose")

const productSchema = new Schema({
  name: String,
  price: Number,
  description: String,
  imageUrl: String,
}, { timestamps: true })

const Product = model("Product",productSchema)

module.exports = Product

