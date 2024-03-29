const mongoose = require("mongoose");

const notificationsSchema = mongoose.Schema(
  {
    message: {
      type: String,
      required: [true, "The message is required"],
    },
    read: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      required: [true, "The title is required"],
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

module.exports = mongoose.model("notification", notificationsSchema);
