const mongoose = require("mongoose");
const validator = require("validator");
const companySchema = mongoose.Schema(
  {
    profile: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "The company profile ID is required"],
    },

    services: {
      type: [
        {
          type: {
            price: {
              type: Number,
              required: [true, "A service must have a price"],
            },
            name: {
              type: String,
              required: [true, "A service must have a name"],
              unique: true,
            },
          },
        },
      ],
      required: [true, "A company must have atleat a service"],
    },
    ratings: {
      type: String,
    },
    about: {
      type: String,
    },
    workHours: {
      type: [
        {
          type: {
            day: {
              type: String,
              required: [true, "Please specify the work day(s)"],
            },
            from: {
              type: Date,
              required: [
                true,
                "Please specify a starting time for your workday",
              ],
            },
            to: {
              type: Date,
              required: [true, "Please specify an end time for your workday"],
            },
          },
        },
      ],
      default: [{ day: "All Day", to: Date.now(), from: Date.now() }],
    },
    socialMedia: {
      type: Map,
      of: String,
      required: "A company must have atleast one social media handle",
    },
    workers: {
      type: [mongoose.Schema.ObjectId],
      ref: "Team",
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Company", companySchema);
