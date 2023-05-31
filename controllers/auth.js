const jwt = require("jsonwebtoken");
const validator = require("validator");
const nodemailer = require("nodemailer");
const sendInBlueTransport = require("nodemailer-sendinblue-transport");

// Utilities import

const AppError = require("../utils/AppError");
const FilterBody = require("../utils/FilterBody");

// model import
const User = require("../models/user");

// async function wrapper import
const catchAsync = require("../utils/catchAsync");
const { send } = require("express/lib/response");

const createToken = (res, id, data, message) => {
  const token = jwt.sign({ id }, process.env.SECRET_CODE);
  data.password = undefined;

  return res.status(200).json({
    status: "success",
    message,
    token,
    data,
  });
};

const sendOTC = async (
  token,
  tokenExpire,
  data,
  req,
  res,
  statusCode,
  status,
  message
) => {
  const tokenValue = Math.floor(10000000 + Math.random() * 90000000);
  const expire = Date.now() + 10 * 60 * 10000;

  data[token] = tokenValue;
  data[tokenExpire] = expire;
  const user = new User(data);
  user.save({ validateBeforeSave: true });
  return res.status(statusCode).json({
    status,
    message,
    data: user,
    token,
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
  // const transporter = nodemailer.createTransport({
  //   host: "smtp-relay.sendinblue.com",
  //   port: "465",
  //   auth: {
  //     user: "devhalltech@gmail.com",
  //     pass: "vPzCZ76SI2aBEJ3w",
  //     // pass: "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",
  //   },
  //   secure: true,
  // });

  // new sendInBlueTransport({
  //   auth: {
  //     // user: "w2bin",
  //     api_key:
  //       "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",
  //   },
  // })

  const mailOptions = {
    from: "w2din@admin.com",
    to: email,
    subject: "Test Email",
    text: "Hello from Nodemailer and Sendinblue!",
  };
  // transporter.sendMail(mailOptions, (error, info) => {
  //   if (error) {
  //     return res.status(403).json({
  //       status: "error",
  //       message: error.message,
  //       error,
  //     });
  //     // return next(new AppError("error from the email", 403));
  //   }

  // });
  createToken(
    res,
    data?._id,
    data,
    "User Logged in successfully and email sent"
  );
});

// create account controller
exports.createAccount = catchAsync(async (req, res, next) => {
  // filtering the request data
  const data = FilterBody(req.body);

  const isValidNigeriaNum = validator.isMobilePhone(data.phone, "en-NG");
  if (!isValidNigeriaNum) {
    return next(new AppError("Please provide a valid Nigeria number"));
  }

  const findUser = await User.findOne({
    $or: [
      { email: data.email },
      { phone: data.phone === undefined ? "1" : data.phone },
    ],
  });

  if (findUser) {
    return next(new AppError("User credential already exist", 409));
  }

  sendOTC(
    "token",
    "tokenExpire",
    data,
    req,
    res,
    201,
    "created",
    "Account created successfully, check your email to verify your account"
  );
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
