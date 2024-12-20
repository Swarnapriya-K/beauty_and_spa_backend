const Product = require("../models/Product");

const getHelloWorld = (req, res) => {
  res.json({ message: "Hello World from Products API!" });
};

module.exports = { getHelloWorld };
