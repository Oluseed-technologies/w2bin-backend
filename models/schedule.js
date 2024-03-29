const mongoose = require("mongoose");
const statesData = require("../datas/location.json");

const state = statesData.map((data, index) => {
  return data.state.toLowerCase();
});
const scheduleSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      required: [true, "The ID of the user fixing the schedule is required"],
      ref: "User",
    },
    type: {
      type: String,
      required: [true, "Please specify  the service type"],
    },
    company: {
      type: mongoose.Schema.ObjectId,
      required: [true, "Please choose a company"],
      ref: "User",
    },
    description: {
      type: String,
      required: [true, "Please enter a proper schdedule  schedule description"],
    },
    country: {
      type: String,
      default: "Nigeria",
    },
    images: {
      type: [String],
    },
    currentLocation: {
      type: Boolean,
      default: true,
      required: [
        true,
        "Please specify if you need to the service to your current location",
      ],
    },
    state: {
      type: String,
      validate: {
        validator: function (val) {
          return state.some((data) => {
            return data === val?.toLowerCase();
          });
        },
        message: `{{VALUE}} is not a valid Nigeria state`,
      },
      required: [true, "Please enter your state"],
    },
    lga: {
      type: String,
      required: [true, "Please enter your local government"],
      validate: {
        validator: function (val) {
          const localGvtAreas = statesData.filter((data, index) => {
            return data.state.toLowerCase() === this.state?.toLowerCase();
          })[0]?.lgas;

          return localGvtAreas?.some((data) => {
            return data?.toLowerCase() === val?.toLowerCase();
          });
        },
        message: `{{VALUE}} Local Government does not exist the specified state`,
      },
    },
    address: {
      type: String,
      required: [true, "Please enter your home address"],
    },
    status: {
      type: String,
      default: "pending",
      enum: {
        values: ["pending", "completed", "approved", "cancelled"],
        message: "Schedule status cannot only be {{VALUE}}",
      },
    },
    price: {
      type: Number,
    },
    token: {
      type: String,
    },
  },
  { timestamps: true }
);

scheduleSchema.pre("aggregate", function (next) {
  console.log("yeah");
  this.pipeline().unshift({ $addFields: { newField: "yeah" } });

  next();
  // {
  //   $addFields: {
  //     // monthName: "$month",
  //     monthName: siteData.months[+"$month"],
  //   },
  // },
});

module.exports = mongoose.model("Schedule", scheduleSchema);
