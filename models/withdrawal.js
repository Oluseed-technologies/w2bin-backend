const mongoose = require("mongoose");

const withdrawalSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      required: [true, "The user ID Is required"],
      ref: "User",
    },
    bankAccount: {
      type: mongoose.Schema.ObjectId,
      ref: "Account",
      required: ["Please provide a bank account ID"],
    },
    wallet: {
      type: mongoose.Schema.ObjectId,
      ref: "Wallet",
      required: ["Please provide the user wallet ID"],
    },
    amount: {
      type: String,
      required: [true, "Please enter the withdrawal amount"],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "success", "fail"],
        message: "{{VALUE}} is not a valid withdrawal status",
      },
      reference: {
        type: String,
        required: [true, "The withdrawal reference is required"],
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Withdrawal", withdrawalSchema);
