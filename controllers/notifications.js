const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const admin = require("firebase-admin");

const app = require("../app");

// JA9aHJ-FqKzAwUNHccO4XC-a4mG9Z_C18XM1BukKIz0
exports.createNotification = catchAsync(async (req, res, next) => {
  if (req.user.device_id) {
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
    token: req.user.device_id,
  };
  //   "eXSssu8WOxRuBjY5tAlmxz:APA91bHKX3PqJ1qH2vdeEVmDd2Hd69ABhO26loDr8qGZqAZl_TWAsJKusoLsPCrq1AfTSa9q6Q-EqoBAELgv2QfXD4jfV1wEUJrQQRUWavoIyo3pdSCkjjV3sgRAaGJ_CLCah2_ngHO-"
  app
    .instance()
    .send(message)
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
  return res.status(200).json({
    status: "success",
    message: "Notification sent successfully",
  });
});
