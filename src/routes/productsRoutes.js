const express = require("express");
const {
  addProduct,
  getProducts,
  deleteProducts,
  editProduct,
  exportProductsCsv,
  exportProductsExcel,
  exportProductsPdf
} = require("../controllers/productsController");
const { authMiddleware } = require("../controllers/userController");
const upload = require("../middlewares/multerConfig");

const router = express.Router();

router.get("/get-products", getProducts);
router.post("/add-product", authMiddleware, upload.single("image"), addProduct);
router.delete("/delete-products", authMiddleware, deleteProducts);
router.patch(
  "/edit-product/:id",
  authMiddleware,
  upload.single("image"),
  editProduct
);
router.get("/export-product-csv", exportProductsCsv);
router.get("/export-product-excel", exportProductsExcel);
router.get("/export-product-pdf", exportProductsPdf);

module.exports = router;
