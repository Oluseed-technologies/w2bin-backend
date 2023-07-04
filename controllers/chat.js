const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const ApiFeature = require("../utils/ApiFeature");

const { NotificationClient } = require("../utils/client");

const socket = require("../socket");

exports.initiateChat = catchAsync(async (req, res, next) => {
  const receiverId = req.params._id;
  if (!receiverId) {
    return next(new AppError("Please provide the RECEIVERS ID", 401));
  }
  const notification = {
    contents: {
      en: "Chat successfully initiated",
    },
    include_external_user_ids: [receiverId],
  };

  const response = await NotificationClient().createNotification(notification);

  return res.status(200).json({
    status: "success",
    message: "chat initiated successfully",
  });
});

exports.sendMessage = catchAsync(async (req, res, next) => {
  socket.getIO().emit("message", "hello");
  //   console.log(socket.getIO().id);
  return res.status(200).json({
    status: "success",
    message: "message sent successfully",
  });
});
