const Category = require("../models/Category");
const XLSX = require("xlsx");
const csv = require("fast-csv");
const fs = require("fs");
const PDFDocument = require("pdfkit");

// Add a new category to the CategoryList collection
const addCategory = async (req, res) => {
  try {
    const { name } = req.body;

    // Check if the category already exists and is inactive
    const existingCategory = await Category.findOne({ name });

    if (existingCategory) {
      // If the category is inactive, reactivate it
      if (!existingCategory.active) {
        existingCategory.active = true; // Set the category to active
        await existingCategory.save(); // Save the changes
        return res.status(200).json({
          message: "Category reactivated successfully!",
          category: existingCategory
        });
      } else {
        // If the category is already active, return a message
        return res.status(400).json({ message: "Category already exists!" });
      }
    }

    // If the category does not exist, create a new one
    const newCategory = new Category({ name, active: true });

    // Save the new category to the database
    await newCategory.save();

    res.status(201).json({
      message: "Category added successfully!",
      category: newCategory
    });
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
};


// Get all categories from the CategoryList collection
const getCategories = async (req, res) => {
  try {
    // Fetch only active categories
    const categories = await Category.find({ active: true }).sort({
      createdAt: -1
    });
    res.status(200).json({
      message: "Active categories fetched successfully",
      categories
    });
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

    // Soft delete: Set `active` to `false` for the given categories
    const categoryResult = await Category.updateMany(
      { _id: { $in: ids }, active: true }, // Update only active categories
      { $set: { active: false } }
    );

    if (categoryResult.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "No active category found to update." });
    }

    res.status(200).json({
      message: `${categoryResult.modifiedCount} categories deactivated successfully.`
    });
  } catch (error) {
    console.error("Error updating categories:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};


const editCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, active } = req.body; // We are now considering the "active" field for reactivation

    // Find the category by ID
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found!" });
    }

    // Check if the name already exists (excluding the current category)
    const duplicateCategory = await Category.findOne({ name });
    if (duplicateCategory && duplicateCategory._id.toString() !== id) {
      return res
        .status(400)
        .json({ message: "Category with this name already exists!" });
    }

    // Update category details
    category.name = name;

    // If the category is being reactivated, ensure 'active' is true
    if (active !== undefined) {
      category.active = active; // This ensures we can reactivate the category if needed
    }

    // Save the updated category
    await category.save();

    res
      .status(200)
      .json({ message: "Category updated successfully!", category });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
};

const exportCsv = async (req, res) => {
  try {
    const categories = await Category.find().exec();
    console.log(categories);

    res.setHeader("Content-Disposition", "attachment; filename=data.csv");
    res.setHeader("Content-Type", "text/csv");

    const flattenedData = categories.map((row) => ({
      id: row.id,
      name: row.name
    }));

    const csvStream = csv.format({ headers: true });
    csvStream.pipe(res);
    flattenedData.forEach((row) => csvStream.write(row));
    csvStream.end();
  } catch (error) {
    console.log("error", error);
    res.status(500).send("Internal service error");
  }
};

const exportExcel = async (req, res) => {
  try {
    const categories = await Category.find().exec();

    const flattenedData = categories.map((row) => ({
      id: row.id,
      name: row.name
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(flattenedData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");

    const filepath = "categories.xlsx";
    XLSX.writeFile(workbook, filepath);

    res.download(filepath, "categories.xlsx", (err) => {
      if (err) console.log("error", err);
      fs.unlinkSync(filepath);
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
};

const exportPdf = async (req, res) => {
  try {
    const categories = await Category.find().exec();

    const flattenedData = categories.map((row) => ({
      id: row.id,
      name: row.name
    }));

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=category.pdf");

    // Create a PDF document and pipe it to the response
    const pdfDoc = new PDFDocument();
    pdfDoc.pipe(res);

    // Add content to the PDF
    pdfDoc.fontSize(16).text("Category List", { align: "center" });
    pdfDoc.moveDown();

    flattenedData.forEach((category, index) => {
      pdfDoc
        .fontSize(12)
        .text(`ID: ${category.id}`)
        .text(`Name: ${category.name}`)
        .moveDown();
    });

    // Finalize the PDF
    pdfDoc.end();
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
};

module.exports = {
  addCategory,
  getCategories,
  deleteCategories,
  editCategory,
  exportCsv,
  exportExcel,
  exportPdf
};
