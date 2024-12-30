const express = require("express");
const {
  getServiceProviders,
  addService,
  getServices,
  getTestAPI
} = require("../controllers/serviceController");
const { authMiddleware } = require("../controllers/userController");

const router = express.Router();

// Define routes
router.get("/test", getTestAPI)
router.get("/serviceProviders", authMiddleware, getServiceProviders);
router.get("/get-services", authMiddleware, getServices);
router.post("/add-service", authMiddleware, addService);

module.exports = router;
