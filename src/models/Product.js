const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true
    },
    deletedCategoryName: String,
    productPrice: {
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
    image: { type: String, default: null, required: true },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    }
  },
  { timestamps: true }
);
module.exports = mongoose.model("Product", productSchema);
