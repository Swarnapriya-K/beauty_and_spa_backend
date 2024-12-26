const express = require("express");
const {
  getHelloWorld,
  getServiceProviders,
} = require("../controllers/serviceController");
const { authMiddleware } = require("../controllers/userController");

const router = express.Router();

router.get("/", authMiddleware, getHelloWorld);
router.get("/serviceProviders", authMiddleware, getServiceProviders)

module.exports = router;
