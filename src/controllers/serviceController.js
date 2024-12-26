const ServiceProvider = require("../models/ServiceProvider");

const getHelloWorld = (req, res) => {
  res.json({ message: "Hello World from Services API!" });
};

const getServiceProviders = async (req, res) => {
  try {
    const serviceProviders = await ServiceProvider.find({});
    console.log(serviceProviders);
    res.status(200).json({ message: "Data fetched", data: serviceProviders });
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error registering user", details: err.message });
  }
};

module.exports = { getHelloWorld, getServiceProviders };
