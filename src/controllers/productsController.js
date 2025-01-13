const Product = require("../models/Product");
const XLSX = require("xlsx");
const csv = require("fast-csv");
const fs = require("fs");
const PDFDocument = require("pdfkit");

// Get Products Controller
const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .populate("categoryId", "name")
      .exec();
    res.status(200).json({
      message: "Products retrieved successfully.",
      products
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Add Product Controller
const addProduct = async (req, res) => {
  try {
    const {
      productName,
      productPrice,
      productQuantity,
      discount,
      description,
      categoryId
    } = req.body;

    console.log(req.body);

    // Validate required fields
    if (!productName || productPrice === null || productQuantity === null) {
      return res
        .status(400)
        .json({ message: "Product name, price, and quantity are required." });
    }

    const imagePath = req.file ? req.file.path : null;
    // Create a new product
    const newProduct = new Product({
      productName,
      productPrice,
      productQuantity,
      discount: discount || null,
      description: description || "",
      image: imagePath,
      categoryId
    });

    // Save to the database
    const savedProduct = await newProduct.save();

    // Respond with the saved product
    res.status(201).json({
      message: "Product added successfully.",
      product: savedProduct
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const deleteProducts = async (req, res) => {
  try {
    // Extract product IDs from the request body
    const { ids } = req.body;

    // Validate that `ids` is an array and not empty
    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ message: "Please provide an array of product IDs." });
    }

    // Delete multiple products using `$in` operator
    const result = await Product.deleteMany({ _id: { $in: ids } });

    // Check if any products were deleted
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No products found to delete." });
    }

    // Respond with a success message
    res.status(200).json({
      message: `${result.deletedCount} product(s) deleted successfully.`
    });
  } catch (error) {
    console.error("Error deleting products:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let updatedProduct = req.body;
    console.log({ updatedProduct, id });

    let product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found!" });
    }

    const duplicateProduct = await Product.findOne({
      productName: updatedProduct.productName
    });
    if (duplicateProduct && duplicateProduct._id.toString() !== id) {
      return res
        .status(400)
        .json({ message: "Product with this name already exists!" });
    }

    // Update fields explicitly
    product.productName = updatedProduct.productName || product.productName;
    product.productPrice = updatedProduct.productPrice || product.productPrice;
    product.discount = updatedProduct.discount || product.discount;
    product.description = updatedProduct.description || product.description;
    product.categoryId = updatedProduct.categoryId || product.categoryId;

    const imagePath = req.file ? req.file.path : updatedProduct.image;
    console.log({ imagePath });

    product.image = imagePath; // Assuming `multer` handles file uploads

    // Save the updated product
    await product.save();

    await product.save();

    res.status(200).json({ message: "Product updated successfully!", product });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
};

const exportProductsCsv = async (req, res) => {
  try {
    const products = await Product.find().populate("categoryId", "name").exec();
    console.log(products);

    res.setHeader("Content-Disposition", "attachment; filename=data.csv");
    res.setHeader("Content-Type", "text/csv");

    const flattenedData = products.map((row) => ({
      id: row.id,
      name: row.productName,
      price: row.productPrice,
      discount: row.discount,
      description: row.description,
      category: row?.categoryId?.name
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

const exportProductsExcel = async (req, res) => {
  try {
    const products = await Product.find().populate("categoryId", "name").exec();
    console.log(products);

    const flattenedData = products.map((row) => ({
      id: row.id,
      name: row.productName,
      price: row.productPrice,
      discount: row.discount,
      description: row.description,
      category: row?.categoryId?.name
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(flattenedData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

    const filepath = "products.xlsx";
    XLSX.writeFile(workbook, filepath);

    res.download(filepath, "products.xlsx", (err) => {
      if (err) console.log("error", err);
      fs.unlinkSync(filepath);
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
};

const exportProductsPdf = async (req, res) => {
  try {
    const products = await Product.find().populate("categoryId", "name").exec();
    console.log(products);

    // Flatten the data for the PDF
    const flattenedData = products.map((row) => ({
      id: row.id,
      name: row.productName,
      price: row.productPrice,
      discount: row.discount,
      description: row.description,
      category: row?.categoryId?.name
    }));

    // Set response headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=products.pdf");

    // Create a PDF document and pipe it to the response
    const pdfDoc = new PDFDocument();
    pdfDoc.pipe(res);

    // Add content to the PDF
    pdfDoc.fontSize(16).text("Products List", { align: "center" });
    pdfDoc.moveDown();

    flattenedData.forEach((product, index) => {
      pdfDoc
        .fontSize(12)
        .text(`ID: ${product.id}`)
        .text(`Name: ${product.name}`)
        .text(`Price: ${product.price}`)
        .text(`Discount: ${product.discount}`)
        .text(`Description: ${product.description}`)
        .text(`Category: ${product.category}`)
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
  addProduct,
  getProducts,
  deleteProducts,
  editProduct,
  exportProductsCsv,
  exportProductsExcel,
  exportProductsPdf
};
