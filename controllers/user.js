const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const ApiFeatures = require("../utils/ApiFeature");
const FilterBody = require("../utils/FilterBody");
const { getData, getDatasById } = require("../utils/factory");

const User = require("../models/auth");
const Company = require("../models/company");

// select
exports.getMyDetails = catchAsync(async (req, res, next) => {
  const data = User.findById(req.user._id);

  const response = await new ApiFeatures(req.query, data).select().populate()
    .query;

  return res.status(200).json({
    status: "success",
    message: " User profile feteched succesfully",
    data: response,
  });
});

exports.updateMyDetails = catchAsync(async (req, res, next) => {
  const { password, confirmPassword } = req.body;

  if (password || confirmPassword) {
    return next(
      new AppError(
        "Please use the update password endpoint to update your password",
        401
      )
    );
  }

  const data = FilterBody(req.body);

  const response = await User.findByIdAndUpdate(req.user._id, data, {
    runValidators: true,
  });

  const user = await User.findById(response._id);

  res.status(200).json({
    status: "success",
    message: "User Profile  updated succesfully",
    data: user,
  });
});

exports.activateUserAccount = catchAsync(async (req, res, next) => {
  const data = FilterBody(req.body, [
    "emailVerified",
    "status",
    "resetToken",
    "resetTokenExpire",
  ]);
  const { address, country, state } = req.body;
  if (!address || !country || !state) {
    return next(
      new AppError(
        "Please provide all details to get your account activated",
        401
      )
    );
  }

  data.status = "active";
  data.password = undefined;
  const response = await User.findByIdAndUpdate(req.user._id, data, {
    runValidators: true,
  });

  const user = await User.findById(response._id);
  res.status(200).json({
    status: "success",
    message: "User account activated successfully",
    user,
  });
});
