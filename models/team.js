const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.ObjectId,
  },
  firstName: {
    type: String,
    required: [true, "Worker first name cannot be empty"],

    minLength: [3, "First Name cannot be less than 3"],
    maxLength: [30, "First Name cannot be greater than 30"],
  },
  lastName: {
    type: String,
    required: [true, "Worker Last name caanot be empty"],
    minLength: [3, "Last Name cannot be less than 3 characters"],
    maxLength: [30, "Last Name cannot be greate than 30 characters"],
  },
  role: {
    type: String,
    required: [true, "A worker must have a role"],
    minLength: [3, "Worker role should not be less than 3 charactes"],
  },
});

module.exports = mongoose.model("team", teamSchema);
