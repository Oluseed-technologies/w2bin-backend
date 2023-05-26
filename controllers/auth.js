const jwt = require("jsonwebtoken");

// Utilities import
const AppError = require("../utils/AppError");
const FilterBody = require("../utils/FilterBody");

// model import
const User = require("../models/user");

// async function wrapper import
const catchAsync = require("../utils/catchAsync");

const createToken = (res, id, data, message) => {
  const token = jwt.sign({ id }, process.env.SECRET_CODE);
  data.password = undefined

  return res.status(200).json({
    status: "success",
    message,
    token,
    data,
  });
};

// login controller
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const data = await User.findOne({ email }).select("+password");
  if (!data || !(await User.comparePassword(password, data.password))) {
    return next(new AppError("incorrect credential", 401));
  }
  delete data.password;

  createToken(res, data?._id, data, "User Logged in successfully");
});

// create account controller
exports.createAccount = catchAsync(async (req, res, next) => {
  const data = FilterBody(req.body, [
    "emailVerified",
    "status",
    "resetToken",
    "resetTokenExpire",
  ]);

  const findUser = await User.findOne({
    $or: [
      { email: data.email },
      { phone: data.phone === undefined ? "1" : data.phone },
    ],
  });

  if (findUser) {
    return next(new AppError("User credential already exist", 409));
  }

  data.status = "pending";

  const response = await User.create(data);
  response.password = undefined;

  res.status(201).json({
    status: "created",
    message: "user created successfully",
    data: response,
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(200).json({
      status: "success",
      message: "An email as been sent to the email provided if it exist",
    });
  }
  const resetToken = Math.floor(10000000 + Math.random() * 90000000);
  user.resetToken = resetToken;
  user.resetTokenExpire = Date.now() + 10 * 60 * 10000;
  console.log(new Date(Date.now()).toUTCString());
  console.log(new Date(Date.now() + 10 * 60 * 1000).toUTCString());
  const response = await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "An email as been sent to the email provided if it exist",
    resetToken,
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token, newPassword } = req.body;
  const user = await User.findOne({
    resetToken: token,
    resetTokenExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError("invalid token or the token  has expire", 409));
  }
  if (!newPassword) {
    return next(new AppError("Please provide your new password", 401));
  }

  user.password = newPassword;
  user.confirmPassword = newPassword;
  user.resetToken = undefined;
  user.resetTokenExpire = undefined;
  const response = await user.save({ validateBeforeSave: true });
  response.password = undefined;
  res.status(200).json({
    status: "success",
    message: "Password successfully changed",
    data: response,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  if (!req.headers.authorization) {
    return next(new AppError("No authorization header found", 401));
  }
  const token = req.headers.authorization.split(" ")[1];
  const decode = jwt.verify(token, process.env.SECRET_CODE);

  const user = await User.findById(decode?.id).select("+password");

  if (!user) {
    return next(new AppError("User with this token does not exist"));
  }
  req.user = user;

  next();
});

exports.changePassword = catchAsync(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (!(await User.comparePassword(oldPassword, req.user.password))) {
    return next(new AppError("invalid old password", 401));
  }
  if (!newPassword) {
    return next(new AppError("New Password is required", 401));
  }

  const user = await User.findById(req.user._id).select("+password");
  user.password = newPassword;
  user.confirmPassword = newPassword;

  const data = await user.save({ validateBeforeSave: true });
  createToken(res, req.user._id, data, "password change successfully");
});

exports.restrict = (...args) => {
  return (req, res, next) => {
    if (!args.includes(req.user.type)) {
      return next(
        new AppError(
          `Only the ${args.join(",")} is authorized to perform this operation`
        )
      );
    }
    if (!req.user.emailVerified) {
      return next(
        new AppError(
          `Please verify your email address to perform this operation`
        )
      );
    }
    if (req.user.status !== "active") {
      return next(
        new AppError(
          `This account is currently ${req.user.status} please contact the admin to activate your account `
        )
      );
    }

    next();
  };
};
