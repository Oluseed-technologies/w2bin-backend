const mongoose = require("mongoose");

const notificationsSchema = mongoose.Schema(
  {
    type: {
      type: String,
    },
    message: {
      type: String,
      required: [true, "The message is required"],
    },
    title: {
      type: String,
      required: [true, "The title is required"],
    },
    read: {
      type: Boolean,
      default: false,
    },
    senderId: {
      type: mongoose.Schema.ObjectId,
      required: [true, "The sender ID is required"],
    },
    receiverIds: {
      type: [mongoose.Schema.ObjectId],
      require: [true, "The receivers IDs are required"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("notification", notificationsSchema);
