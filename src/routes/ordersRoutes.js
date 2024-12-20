const express = require("express");
const { getHelloWorld } = require("../controllers/ordersController");
const { authMiddleware } = require("../controllers/userController");
const roleBasedAuthorization = require("../middlewares/roleBasedAuthorization");

const router = express.Router();

router.get("/", authMiddleware, roleBasedAuthorization("admin"), getHelloWorld);

module.exports = router;
