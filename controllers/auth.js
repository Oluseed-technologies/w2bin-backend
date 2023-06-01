const jwt = require("jsonwebtoken");

const Email = require("../utils/email");
const states = require("../datas/location.json");
const { capitalize, GenerateOtp, validateNumber } = require("../utils/utils");

// Utilities import

const AppError = require("../utils/AppError");
const FilterBody = require("../utils/FilterBody");

// model import
const User = require("../models/user");

// async function wrapper import
const catchAsync = require("../utils/catchAsync");
const { send } = require("express/lib/response");
const { body } = require("express-validator");

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

const sendTokenResponse = async (
  token,
  tokenExpire,
  data,
  req,
  res,
  statusCode,
  status,
  message
) => {
  data[token] = tokenValue;
  data[tokenExpire] = expire;
  const emailInstance = new Email(data.email);
  await emailInstance.sendOTP(tokenValue);
  const user = await new User(data);
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

  if (!validateNumber)
    return next(new AppError("Please provide a valid Nigeria number"));

  if (!data.state) return next(new AppError("Please provide your state"));
  console.log(data.state);
  console.log(capitalize(data.state));

  const getState = states.filter((value, index) => {
    return value.state == capitalize(data.state);
  });
  console.log(getState);
  if (getState.length === 0)
    return next(new AppError("Please provide a valid state", 400));

  if (!data.lga)
    return next(new AppError("Please enter your local government area", 400));
  const lgas = getState[0].lgas;

  const getLga = lgas.find((value, index) => {
    return value === capitalize(data.lga);
  });
  if (!getLga) {
    return next(
      new AppError("Please provide a valid Local Government Area", 400)
    );
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

  data.type === "user" ? (data.active = "active") : (data.active = "pending");

  const { token, expire } = GenerateOtp();

  const emailInstance = new Email(data.email);
  await emailInstance.sendWelcomeOTP(token);

  data.token = token;
  data.tokenExpire = expire;
  const user = await User.create(data);

  res.status(200).json({
    status: "created",
    message: "Account created successfully, check your email to verify",
    data: user,
  });
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { email } = req.query;
  console.log(email);
  const { token } = req.body;
  if (!token) {
    return next(new AppError("Please provide both the email and token", 402));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new AppError("This email does not exist", 402));
  }

  if (user.emailVerified) {
    return next(new AppError("This  email is already verified", 200));
  }
  console.log(user.token);
  console.log(token);
  if (user.token !== +token) {
    return next(new AppError("This token is invalid or it has expired", 402));
  }

  user.token = undefined;
  user.tokenExpire = undefined;
  user.emailVerified = true;
  user.confirmPassword = user.password;
  await user.save({ validateBeforeSave: true });
  createToken(res, user._id, user, "Email successfully verified");
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
  const { token, expire } = GenerateOtp();

  const emailInstance = new Email(user.email);
  await emailInstance.sendPasswordOTP(token);

  user.resetToken = token;
  user.resetTokenExpire = expire;

  const response = await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "An email as been sent to the email provided if it exist",
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

exports.lessRestriction = (...args) => {
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

    next();
  };
};
