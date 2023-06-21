const mongoose = require("mongoose");

const bankSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      required: [true, "Please provide the user ID"],
    },
    accountNumber: {
      type: Number,
      required: [true, "Please provide the account number"],
    },
    bankCode: {
      type: Number,
      required: [true, "Please provide the bankcode"],
    },
    accountName: {
      type: String,
      required: [true, "Please provide the account name"],
    },
    bankName: {
      type: String,
      required: [true, "Please provide the Bank Name"],
    },
  },
  {
    timestamps: true,
  }
);

bankSchema.pre("save", function (next) {
  next();
  console.log("saving");
});

module.exports = mongoose.model("Accounts", bankSchema);
