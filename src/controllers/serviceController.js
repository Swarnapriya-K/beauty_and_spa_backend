const ServiceProvider = require("../models/ServiceProvider");
const Service = require("../models/Service"); // Import the Service model

// Hello World endpoint (optional)
const getTestAPI = (req, res) => {
  res.json({ message: "Hello World from Services API!" });
};

// Fetch all service providers
const getServiceProviders = async (req, res) => {
  try {
    const serviceProviders = await ServiceProvider.find({});
    console.log(serviceProviders);
    res.status(200).json({ message: "Data fetched", data: serviceProviders });
  } catch (err) {
    res.status(400).json({
      error: "Error fetching data",
      details: err.message
    });
  }
};

// Add a new service
const addService = async (req, res) => {
  try {
    const { serviceName, servicePrice, serviceProviders } = req.body;

    // Check if required fields are present
    if (!serviceName || servicePrice === undefined) {
      return res.status(400).json({
        message: "Service name and price are required."
      });
    }

    const service = await Service.find({ serviceName });

    console.log(service);
    if (Array.isArray(service) && service.length > 0) {
      return res.status(400).json({
        message: "Sevice with the same name already exists"
      });
    }

    // Create a new service
    const newService = new Service({
      serviceName,
      servicePrice,
      serviceProviders: serviceProviders || [] // Default to empty array if no members
    });

    // Save the service to the database
    const savedService = await newService.save();

    // Respond with the saved service data
    res.status(201).json({
      message: "Service added successfully!",
      service: savedService
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error adding service",
      details: err.message
    });
  }
};

// Fetch all services
const getServices = async (req, res) => {
  try {
    // Fetch all services from the database
    const services = await Service.find({});

    // Respond with the services data
    res.status(200).json({
      message: "Services fetched successfully",
      services: services
    });
  } catch (err) {
    // Error handling
    res.status(400).json({
      error: "Error fetching services",
      details: err.message
    });
  }
};

module.exports = {
  getTestAPI,
  getServiceProviders,
  addService,
  getServices
};
