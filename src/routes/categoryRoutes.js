// routes/categoryRoutes.js
const express = require("express");
const {
  addCategory,
  getCategories,
  deleteCategories,
  editCategory
} = require("../controllers/categoryController");
const router = express.Router();

// Route to add a new category
router.post("/add-category", addCategory);

// Route to get all categories
router.get("/get-category", getCategories);

router.delete("/delete-categories", deleteCategories);

router.patch("/edit-category/:id", editCategory)

module.exports = router;
