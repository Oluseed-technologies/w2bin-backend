const mongoose = require("mongoose");
const validator = require("validator");

const workHoursSchema = mongoose.Schema({
  day: {
    type: String,
    required: [true, "Please choose a day"],
    enum: {
      values: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      message: "Please provide a valid day of the week",
    },
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

const socialMediaSchema = mongoose.Schema({
  whatsapp: {
    type: String,
    validate: [validator.isURL, "Please enter a valid link"],
    required: [true, "Please provide your whatsapp link"],
  },
  facebook: {
    type: String,
    validate: [validator.isURL, "Please enter a valid link"],
    required: [true, "Please provide your facebook link"],
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
      ref: "Auth",
      required: [true, "The company profile ID is required"],
    },
    services: {
      ref: "Service",
      type: [mongoose.Schema.ObjectId],
      required: [
        true,
        "Please add atleast one service to complete your profile",
      ],
      validate: {
        validator: function (val) {
          return val.length !== 0;
        },
        message: "Please add atleast one service",
      },
    },
    about: {
      type: String,
      required: [true, "Please enter about the company"],
    },
    workHours: {
      type: [workHoursSchema],
      required: [true, "Please provide your company workhours"],
      validate: {
        validator: function (val) {
          return val.length !== 0;
        },
        message: "Please provide your company workhours",
      },
    },
    socialMedia: {
      type: [socialMediaSchema],
      required: [true, "A company must have atleast one social media handle"],
      validate: {
        validator: function (val) {
          return val.length !== 0;
        },
        message: "A company must have atleast one social media handle",
      },
    },
    workers: {
      type: [mongoose.Schema.ObjectId],
      ref: "Team",
      required: [true, "A company must have atleast one worker"],
      validate: {
        validator: function (val) {
          return val.length !== 0;
        },
        message: "A company must have atleast one worker",
      },
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Company", companySchema);
