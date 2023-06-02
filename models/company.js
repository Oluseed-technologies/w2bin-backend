const mongoose = require("mongoose");
const validator = require("validator");

const workHoursSchema = new mongoose.Schema({
  day: {
    type: String,
    required: [true, "Please choose a day"],
    enum: [
      "monnday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ],
  },
  startHour: {
    type: Number,
    required: [true, "Please specify the start hours"],
    min: 0,
    max: 23,
  },
  endHour: {
    type: Number,
    required: [true, "Please specify the end hour"],
    min: 0,
    max: 23,
  },
});

const socialMediaSchema = new mongoose.Schema({
  whatsapp: {
    type: String,
    validate: [validator.isURL, "Please enter a valid link"],
  },
  facebook: {
    type: String,
    validate: [validator.isURL, "Please enter a valid link"],
  },
  twitter: {
    type: String,
    validate: [validator.isURL, "Please enter a valid link"],
  },
  instagram: {
    type: String,
    validate: [validator.isURL, "Please enter a valid link"],
  },
});

const companySchema = mongoose.Schema(
  {
    profile: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "The company profile ID is required"],
    },

    services: {
      ref: "Service",
      type: [mongoose.Schema.ObjectId],
      required: [
        true,
        "Please add atleast one service to complete your profile",
      ],
    },
    about: {
      type: String,
      required: [true, "About the company is required"],
      minLength: [
        30,
        "The company about us should not be less than 30 characters",
      ],
    },
    workHours: {
      type: [workHoursSchema],
      required: [true, "Please provide your company workhours"],
    },
    socialMedia: {
      type: [socialMediaSchema],
      required: "A company must have atleast one social media handle",
    },
    workers: {
      type: [mongoose.Schema.ObjectId],
      ref: "Team",
      required: [true, "A company must have atleast one worker"],
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Company", companySchema);
