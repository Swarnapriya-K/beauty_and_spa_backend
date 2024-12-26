const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
    trim: true
  },
  productPrice: {
    type: Number,
    required: true,
    min: 1
  },
  productQuantity: {
    type: Number,
    required: true,
    min: 1
  },
  discount: {
    type: Number,
    default: null,
    min: 0,
    max: 100
  },
  description: {
    type: String,
    default: "",
    trim: true
  },
  image: { type: String, default: null }
});

module.exports = mongoose.model("Product", productSchema);
