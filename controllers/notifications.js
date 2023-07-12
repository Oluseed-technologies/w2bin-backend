const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const ApiFeatures = require("../utils/ApiFeature");

const admin = require("firebase-admin");

const OneSignal = require("onesignal-node");

const app = require("../app");

const axios = require("axios");

const { NotificationClient } = require("../utils/client");

const Notification = require("../models/notifications");

// JA9aHJ-FqKzAwUNHccO4XC-a4mG9Z_C18XM1BukKIz0
exports.createNotification = catchAsync(async (req, res, next) => {
  const notification = {
    contents: {
      en: "Good Morning Sir, it is nice meeting you",
    },
    include_player_ids: ["62eb772f-a933-4540-bd3f-0636f38abdbf"],
  };

  const response = await NotificationClient().createNotification(notification);

  return res.status(200).json({
    status: "success",
    message: "Notification sent successfully",
  });
});

exports.getNotifications = catchAsync(async (req, res, next) => {
  const data = Notification.find({
    receiverIds: req.user._id,
  });
  const notifications = await new ApiFeatures(req.query, data).populate().query;

  return res.status(200).json({
    status: "success",
    message: "Notifications data fetched successfully",
    data: notifications,
  });
});
