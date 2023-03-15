const mongoose = require("mongoose");

const serviceSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    required: [true, "Your ID is required"],
  },
  company: {
    type: mongoose.Schema.ObjectId,
    required: [true, "Company ID is required"],
  },
  country: {
    type: String,
    required: [true, "Country name is required"],
  },
  state: {
    type: String,
    required: [true, "State name is required"],
  },
  budget: {
    type: Number,
    required: [true, "Please provide your budget"],
  },
  status: {
    type: String,
    default: "pending",
  },
  service: {
    type: {
      name: { type: String, required: [true, "A service must have a name"] },
      price: { type: Number, required: [true, "A service must have a price"] },
    },
    required: [true, "The service is required"],
  },
  address: {
    type: String,
    required: [true, "Address  is required"],
  },
});

module.exports = mongoose.model("Service", serviceSchema);
