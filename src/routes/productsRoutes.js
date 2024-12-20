const express = require("express");
const { getHelloWorld } = require("../controllers/productsController");
const { authMiddleware } = require("../controllers/userController");

const router = express.Router();

router.get("/", authMiddleware, getHelloWorld);

module.exports = router;
