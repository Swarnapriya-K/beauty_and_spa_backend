const Product = require("../models/Product");

// Get Products Controller
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("categoryId", "name").exec();
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
    console.log(req.body);

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

    const imagePath = req.file ? req.file.path : null;
    console.log(imagePath);

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

module.exports = { addProduct, getProducts, deleteProducts, editProduct };
