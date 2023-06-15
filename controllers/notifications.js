const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const admin = require("firebase-admin");

const app = require("../app");

// JA9aHJ-FqKzAwUNHccO4XC-a4mG9Z_C18XM1BukKIz0
exports.createNotification = catchAsync(async (req, res, next) => {
  if (!req.user.device_id) {
    return next(
      new AppError(
        "Contact the admin to get your accoount activated for notifcation",
        401
      )
    );
  }
  const message = {
    notification: {
      title: "New message",
      body: "You have a new message",
    },
    token:
      "eXSssu8WOxRuBjY5tAlmxz:APA91bFIORftGoUw2AaTK_p1w30XY7ag7cQU0b2EdsU4yoMW3jCooLIfA53Ds3hwtF1iLOx70WwTY054UaZYPerA0oMGnIqQ83YlIZO-VKZk8jac7vjpjeUffyzXwU0Da5lZtbO_YC3P",
    // token: req.user.device_id,
  };
  const response = await app.instance().send(message);
  console.log(response);
  return res.status(200).json({
    status: "success",
    message: "Notification sent successfully",
  });
});
