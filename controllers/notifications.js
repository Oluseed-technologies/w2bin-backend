const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const admin = require("firebase-admin");

const OneSignal = require("onesignal-node");

const app = require("../app");

const axios = require("axios");

const { NotificationClient } = require("../utils/client");

// JA9aHJ-FqKzAwUNHccO4XC-a4mG9Z_C18XM1BukKIz0
exports.createNotification = catchAsync(async (req, res, next) => {
  const notification = {
    contents: {
      en: "Good Morning Sir, it is nice meeting you",
    },
    include_external_user_ids: ["648083659d412d04ee8ba5e9"],
  };

  const response = await NotificationClient().createNotification(notification);

  return res.status(200).json({
    status: "success",
    message: "Notification sent successfully",
  });
});
