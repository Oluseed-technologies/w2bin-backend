const AppError = require("../utils/AppError");
const FilterBody = require("../utils/FilterBody");
const ApiFeatures = require("../utils/ApiFeature");

// model import
const User = require("../models/auth");

// async function wrapper import
const catchAsync = require("../utils/catchAsync");

exports.getUsers = catchAsync(async (req, res, next) => {
  const query = User.find();

  const users = await new ApiFeatures(req.query, query).select();

  res.status(200).json({
    status: "success",
    message: "user fetched successfully",
    data: {
      users,
    },
  });
});

exports.updateUserStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  const response = await User.findByIdAndUpdate(
    id,
    { status },
    { runValidators: true }
  );
  const user = await User.findById(response._id);
  console.log(user);
  res.status(200).json({
    status: "success",
    message: "User Updated updated  successfully",
    data: user,
  });
});
