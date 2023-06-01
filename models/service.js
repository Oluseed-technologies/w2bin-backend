const mongoose = require("mongoose");

const serviceSchema = mongoose.Schema({
  company: {
    type: mongoose.Schema.ObjectId,
    required: [true, "Company ID is required"],
  },
  name: {
    type: String,
  },
  budget: {
    type: Number,
    required: [true, "Please provide your budget"],
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
