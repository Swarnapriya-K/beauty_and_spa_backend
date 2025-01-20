const Cart = require("../models/Cart");
const Product = require("../models/Product");

const addProductsToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const { id: userId } = req.user;

    // Find the product to get its price
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send("Product not found");
    }

    const subtotal = product.productPrice * quantity;

    // // Check if the cart exists
    let cart = await Cart.findOne({ userId });

    if (cart) {
      // Check if the product is already in the cart
      const productIndex = cart.products.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (productIndex > -1) {
        // Update the quantity and subtotal of the existing product
        cart.products[productIndex].quantity += quantity;
        cart.products[productIndex].subtotal += subtotal;
      } else {
        // Add the new product to the cart
        cart.products.push({ productId, quantity, subtotal });
      }
    } else {
      // Create a new cart
      cart = new Cart({
        userId,
        products: [{ productId, quantity, subtotal }]
      });
    }

    await cart.save();
    res.status(200).send("Product added to cart successfully");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
};

const getCartItems = async (req, res) => {
  try {
    const { id: userId } = req.user;

    const cart = await Cart.findOne({ userId }).populate("products.productId");

    if (!cart) {
      return res.status(404).send("Cart not found");
    }

    res.status(200).json(cart);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
};

const removeProductsFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const { id: userId } = req.user;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).send("Cart not found");
    }

    cart.products = cart.products.filter(
      (item) => item.productId.toString() !== productId
    );

    await cart.save();
    res.status(200).send("Product removed from cart successfully");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
};

const increaseQuantity = async (req, res) => {
  try {
    const { productId } = req.body;

    const { id: userId } = req.user;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).send("Cart not found");
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send("Product not found");
    }

    const productIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (productIndex > -1) {
      cart.products[productIndex].quantity += 1;
      cart.products[productIndex].subtotal += product.productPrice;
    }

    await cart.save();
    res.status(200).send("Quantity increased successfully");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
};

const decreaseQuantity = async (req, res) => {
  try {
    const { productId } = req.body;
    const { id: userId } = req.user;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).send("Cart not found");
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send("Product not found");
    }

    const productIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (productIndex > -1) {
      if (cart.products[productIndex].quantity > 1) {
        cart.products[productIndex].quantity -= 1;
        cart.products[productIndex].subtotal -= product.productPrice;
      } else {
        cart.products.splice(productIndex, 1); // Remove the product if quantity is 1
      }
    }

    await cart.save();
    res.status(200).send("Quantity decreased successfully");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
};

module.exports = {
  addProductsToCart,
  getCartItems,
  removeProductsFromCart,
  increaseQuantity,
  decreaseQuantity
};
