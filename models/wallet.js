const mongoose = require("mongoose");

const walletSchema = mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.ObjectId,
      required: [true, "The user ID is required"],
    },
    total_amount: {
      type: Number,
      default: 0,
    },

    withdrawable_amount: {
      type: Number,
      default: 0,
    },
    non_withdrawable_amount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Wallet", walletSchema);
