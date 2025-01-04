const express = require("express");
const {
  addProduct,
  getProducts,
  deleteProducts,
  editProduct
} = require("../controllers/productsController");
const { authMiddleware } = require("../controllers/userController");
const upload = require("../middlewares/multerConfig");

const router = express.Router();

router.get("/get-products", authMiddleware, getProducts);
router.post("/add-product", authMiddleware, upload.single("image"), addProduct);
router.delete("/delete-products", authMiddleware, deleteProducts);
router.patch(
  "/edit-product/:id",
  authMiddleware,
  upload.single("image"),
  editProduct
);

module.exports = router;
