const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const ApiFeatures = require("../utils/ApiFeature");
const User = require("../models/auth");
const Chat = require("../models/chat");

const { NotificationClient } = require("../utils/client");

const socket = require("../socket");

exports.initiateChat = catchAsync(async (req, res, next) => {
  const receiverId = req.params._id;
  if (!receiverId) {
    return next(new AppError("Please provide the RECEIVERS ID", 401));
  }

  const user = await User.findById(receiverId);
  if (!user) {
    return next(new AppError("This user does not exist", 401));
  }
  const notification = {
    title: "Chat initiate",
    contents: {
      en: "A schedule negotation was initiated",
    },
    include_player_ids: [user?.device_id],
  };

  const response = await NotificationClient().createNotification(notification);

  return res.status(200).json({
    status: "success",
    message: "chat initiated successfully",
  });
});

exports.sendMessage = catchAsync(async (req, res, next) => {
  const { message, receiverId } = req.body;

  if (!(await User.findById(receiverId))) {
    return next(new AppError("A user with this ID does not exist", 401));
  }

  const response = await Chat.create({
    message,
    receiverIds: [receiverId],
    senderId: req.user._id,
  });

  return res.status(200).json({
    status: "success",
  });
});

exports.getChats = catchAsync(async (req, res, next) => {
  const data = Chat.find({
    $or: [{ receiverIds: req.user._id }, { senderId: req.user._id }],
  });
  const response = await new ApiFeatures(req.query, data).populate().query;

  return res.status(200).json({
    status: "success",
    message: "chats  fetched successfully",
    data: response,
  });
});
