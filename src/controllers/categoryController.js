const Category = require("../models/Category");

// Add a new category to the CategoryList collection
const addCategory = async (req, res) => {
  try {
    const { name } = req.body;

    // Check if the category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists!" });
    }

    // Create a new category
    const newCategory = new Category({ name });

    // Save the new category to the database
    await newCategory.save();

    res
      .status(201)
      .json({ message: "Category added successfully!", category: newCategory });
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
};

// Get all categories from the CategoryList collection
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res
      .status(200)
      .json({ message: "Categories fetched successfully", categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

const deleteCategories = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ message: "Please provide an array of category IDs." });
    }

    const result = await Category.deleteMany({ _id: { $in: ids } });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No category found to delete." });
    }

    res.status(200).json({
      message: `${result.deletedCount} categories deleted successfully.`
    });
  } catch (error) {
    console.error("Error deleting categories:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const editCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found!" });
    }

    const duplicateCategory = await Category.findOne({ name });
    if (duplicateCategory && duplicateCategory._id.toString() !== id) {
      return res
        .status(400)
        .json({ message: "Category with this name already exists!" });
    }

    category.name = name;
    await category.save();

    res
      .status(200)
      .json({ message: "Category updated successfully!", category });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
};

module.exports = { addCategory, getCategories, deleteCategories, editCategory };
