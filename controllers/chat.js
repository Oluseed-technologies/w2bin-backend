const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const ApiFeature = require("../utils/ApiFeature");

const socket = require("../socket");

exports.sendMessage = catchAsync(async (req, res, next) => {
  socket.getIO().emit("message", "hello");
  //   console.log(socket.getIO().id);
  return res.status(200).json({
    status: "success",
    message: "message sent successfully",
  });
});
