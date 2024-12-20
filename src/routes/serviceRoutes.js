const express = require("express");
const { getHelloWorld } = require("../controllers/serviceController");
const { authMiddleware } = require("../controllers/userController");

const router = express.Router();

router.get("/", authMiddleware, getHelloWorld);

module.exports = router;
