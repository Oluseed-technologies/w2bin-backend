const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const ApiFeatures = require("../utils/ApiFeature");
const FilterBody = require("../utils/FilterBody");
const { getData, getDatasById } = require("../utils/factory");

const multer = require("multer");
const sharp = require("sharp");

const User = require("../models/auth");
const Company = require("../models/company");

const storage = multer.memoryStorage();

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

const fileFilter = (req, file, cb) => {
  console.log({ file });
  cb(null, true);
};

const upload = multer({ storage, fileFilter });
exports.uploadImage = upload.single("image");
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

exports.updateProfileImage = catchAsync(async (req, res, next) => {
  console.log("Logging the file");
  if (!req.file) return next(new AppError("Please select a file", 401));
  cloudinary.uploader
    .upload_stream({ resource_type: "image" }, (err, result) => {
      if (err) return next(err);
      User.findByIdAndUpdate(
        req.user._id,
        { image: result.secure_url },
        {
          runValidators: false,
          new: true,
        }
      ).then((data) => {
        console.log(data);
        return res.status(200).json({
          status: "success",
          message: "Image Upload successful",
          data,
        });
      });
    })
    .end(req.file.buffer);
});

exports.updateCoverImage = catchAsync(async (req, res, next) => {
  console.log("Logging the file");
  if (!req.file) return next(new AppError("Please select a file", 401));
  cloudinary.uploader
    .upload_stream({ resource_type: "image" }, (err, result) => {
      if (err) return next(err);
      User.findByIdAndUpdate(
        req.user._id,
        { coverImage: result.secure_url },
        {
          runValidators: false,
          new: true,
        }
      ).then((data) => {
        console.log(data);
        return res.status(200).json({
          status: "success",
          message: "Cover Image Upload successful",
          data,
        });
      });
    })
    .end(req.file.buffer);
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
