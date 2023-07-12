const mongoose = require("mongoose");

const chatSchema = mongoose.Schema(
  {
    message: {
      type: String,
      required: [true, "The message is required"],
    },
    resolve: {
      type: Boolean,
      default: false,
    },
    senderId: {
      type: mongoose.Schema.ObjectId,
      required: [true, "The sender ID is required"],
      ref: "User",
    },
    receiverIds: {
      type: [mongoose.Schema.ObjectId],
      require: [true, "The receivers IDs are required"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("chat", chatSchema);
