const AppError = require("../utils/AppError");
const FilterBody = require("../utils/FilterBody");
const ApiFeatures = require("../utils/ApiFeature");
const { getData, getAllDatas } = require("../utils/factory");

// model import
const Auth = require("../models/auth");
const Schedule = require("../models/schedule");

// async function wrapper import
const catchAsync = require("../utils/catchAsync");

exports.getUsers = catchAsync(async (req, res, next) => {
  const query = Auth.find();

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
  const { _id } = req.params;
  console.log(_id);
  const { status } = req.body;
  const response = await Auth.findByIdAndUpdate(
    _id,
    { status },
    { runValidators: true, new: true }
  );

  res.status(200).json({
    status: "success",
    message: "User Updated updated  successfully",
    data: response,
  });
});

exports.fetchSchedules = getAllDatas(Schedule);
