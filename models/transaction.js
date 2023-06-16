const mongoose = require("mongoose");

const transactionSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
    },
    amount: {
      type: Number,
      required: [true, "Please enter the amount"],
    },
    status: {
      type: String,
      default: "pending",
      enum: {
        values: ["pending", "success", "fail"],
        message: "The {{VALUE}} status type is not valid",
      },
    },
    reference: {
      type: String,
    },
    purpose: {
      type: String,
      required: [true, "Please enter the transaction purpose"],
      enum: {
        values: ["Payment"],
        message: "{{VALUE}} is an Invalid transaction purpose",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("transaction", transactionSchema);