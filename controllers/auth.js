const jwt = require("jsonwebtoken");

const Email = require("../utils/email");
const states = require("../datas/location.json");
const { GenerateOtp, validateNumber } = require("../utils/utils");

// Utilities import

const AppError = require("../utils/AppError");
const FilterBody = require("../utils/FilterBody");

// model import
const Auth = require("../models/auth");

// async function wrapper import
const catchAsync = require("../utils/catchAsync");
const { send } = require("express/lib/response");
const { body } = require("express-validator");
const validator = require("validator");

const createToken = (res, id, data, message) => {
  const token = jwt.sign({ id }, process.env.SECRET_CODE);
  data.password = undefined;
  data.confirmPassword = undefined;

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
  const user = await new Auth(data);
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
  const data = await Auth.findOne({ email }).select("+password");
  if (!data || !(await Auth.comparePassword(password, data.password))) {
    return next(new AppError("incorrect credential", 401));
  }
  delete data.password;

  createToken(res, data?._id, data, "User Logged in successfully");
});

// create account controller

exports.createAccount = catchAsync(async (req, res, next) => {
  const data = FilterBody(req.body);
  if (data.type === "super-admin" || data.type === "admin") {
    return next(
      new AppError(
        `Only the super-admin is allowed to create a ${data.type} account`
      )
    );
  }

  const user = await Auth.findOne({
    $or: [{ email: data.email }, { phone: data.phone }],
  });

  if (user) {
    return next(
      new AppError(
        "User credential already exist or account already exist",
        409
      )
    );
  }

  data.type === "user" ? (data.status = "active") : (data.status = "pending");

  const { token, expire } = GenerateOtp();

  const emailInstance = new Email(data.email);
  await emailInstance.sendWelcomeOTP(token);

  data.token = token;
  data.tokenExpire = expire;
  const response = await Auth.create(data);

  response.password = undefined;
  response.tokenExpire = undefined;
  response.token = undefined;

  res.status(201).json({
    status: "created",
    message: "Account created successfully, check your email to verify",
    data: response,
  });
});

exports.requestVerification = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email || !validator.isEmail(email)) {
    return next(new AppError("Please provide a valid email", 401));
  }
  const { token, expire } = GenerateOtp();
  const data = await Auth.findOne({ email });

  data && data.emailVerified
    ? next(new AppError("This  email is already verified", 401))
    : "";

  data ? (data.token = token) : "";

  const emailInstance = new Email(email);
  await emailInstance.sendWelcomeOTP(token);

  const response = data && (await data.save({ validateBeforeSave: false }));

  res.status(200).json({
    status: "success",
    message:
      "If an account with this email exists, an email has been sent to you.",
  });
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.body;
  if (!token) {
    return next(new AppError("Please enter the token", 402));
  }
  const user = await Auth.findOne({ token }).select("+password");
  if (!user) {
    return next(new AppError("This token is invalid or has expired", 401));
  }

  if (user.emailVerified) {
    return next(new AppError("This  email is already verified", 401));
  }
  console.log(user.token);
  console.log(token);

  user.token = undefined;
  user.tokenExpire = undefined;
  user.resetToken = undefined;
  user.resetTokenExpire = undefined;
  user.emailVerified = true;
  await user.save({ validateBeforeSave: false });
  createToken(res, user._id, user, "Email successfully verified");
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email || !validator.isEmail(email)) {
    return next(new AppError("Please provide a valid email", 401));
  }
  const user = await Auth.findOne({ email });

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
  !token && next(new AppError("Please enter the token sent to you", 401));

  const user = await Auth.findOne({
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

  const data = await user.save({ validateBeforeSave: true });

  data.password = undefined;
  createToken(res, user._id, data, "password change successfully");
});

exports.protect = catchAsync(async (req, res, next) => {
  if (!req.headers.authorization) {
    return next(new AppError("No authorization header found", 401));
  }
  const token = req.headers.authorization.split(" ")[1];
  const decode = jwt.verify(token, process.env.SECRET_CODE);

  const user = await Auth.findById(decode?.id).select("+password");

  if (!user) {
    return next(new AppError("User with this token does not exist"));
  }
  req.user = user;

  next();
});

exports.changePassword = catchAsync(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (!(await Auth.comparePassword(oldPassword, req.user.password))) {
    return next(new AppError("invalid old password", 401));
  }
  if (!newPassword) {
    return next(new AppError("New Password is required", 401));
  }

  const user = await Auth.findById(req.user._id).select("+password");
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
