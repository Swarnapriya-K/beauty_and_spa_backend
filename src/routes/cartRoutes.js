// routes/cartRoutes.js
const express = require("express");
const {
  addProductsToCart,
  getCartItems,
  removeProductsFromCart,
  increaseQuantity,
  decreaseQuantity
} = require("../controllers/cartController");
const { authMiddleware } = require("../controllers/userController");
const router = express.Router();

// Route to add a new category
router.post("/add-products-to-cart", authMiddleware, addProductsToCart);

// Route to get all categories
router.get("/get-cart-items", authMiddleware, getCartItems);

router.post(
  "/remove-products-from-cart",
  authMiddleware,
  removeProductsFromCart
);

router.patch("/increase-product-quantity", authMiddleware, increaseQuantity);

router.patch("/decrease-product-quantity", authMiddleware, decreaseQuantity);

module.exports = router;
