// routes/ordersRoutes.js
const express = require("express");
const router = express.Router();
const {
  addOrder,
  getOrder,
  getOrders,
  exportOrdersCsv,
  exportOrdersExcel,
  exportOrdersPdf
} = require("../controllers/ordersController");
const { authMiddleware } = require("../controllers/userController");

router.post("/", authMiddleware, addOrder);
// router.get("/:id", getOrder);
router.get("/", getOrders);
router.get("/export-order-csv", exportOrdersCsv);
router.get("/export-order-excel", exportOrdersExcel);
router.get("/export-order-pdf", exportOrdersPdf);

module.exports = router;
