const mongoose = require("mongoose");

const serviceSchema = mongoose.Schema({
  company: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  name: {
    type: String,
    required: [true, "Please enter service name"],
  },
  price: {
    type: Number,
  },
  description: {
    type: String,
    required: [true, " Please provide a concise description"],
    minLength: [50, " Service description must not be less than 50 characters"],
  },
});

module.exports = mongoose.model("Service", serviceSchema);
