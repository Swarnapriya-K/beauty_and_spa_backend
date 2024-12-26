const mongoose = require("mongoose");

const serviceProviderSchema = new mongoose.Schema({
  name: { type: String, required: true }
});

module.exports = mongoose.model(
  "ServiceProvider",
  serviceProviderSchema,
  "serviceProviders"
);
