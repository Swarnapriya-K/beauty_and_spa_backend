// routes/categoryRoutes.js
const express = require("express");
const {
  addCategory,
  getCategories,
  deleteCategories,
  editCategory,
  exportCsv,
  exportExcel,
  exportPdf
} = require("../controllers/categoryController");
const router = express.Router();

// Route to add a new category
router.post("/add-category", addCategory);

// Route to get all categories
router.get("/get-category", getCategories);

router.put("/delete-categories", deleteCategories);

router.patch("/edit-category/:id", editCategory);

router.get("/export-category-csv", exportCsv);

router.get("/export-category-excel", exportExcel);

router.get("/export-category-pdf", exportPdf);

module.exports = router;
