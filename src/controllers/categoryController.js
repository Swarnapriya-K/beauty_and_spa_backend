const Category = require("../models/Category");
const Product = require("../models/Product")
const XLSX = require("xlsx");
const csv = require("fast-csv");
const fs = require("fs");
const PDFDocument = require("pdfkit");

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
    const categories = await Category.find().sort({ createdAt: -1 });
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

    // Delete associated products
    const productResult = await Product.deleteMany({ categoryId: { $in: ids } });


    console.log(productResult)

    // Delete the categories
    const categoryResult = await Category.deleteMany({ _id: { $in: ids } });

    if (categoryResult.deletedCount === 0) {
      return res.status(404).json({ message: "No category found to delete." });
    }

    res.status(200).json({
      message: `${categoryResult.deletedCount} categories and ${productResult.deletedCount} products deleted successfully.`
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
