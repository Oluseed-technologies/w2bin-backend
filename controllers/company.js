const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const Company = require("../models/company");
const Team = require("../models/team");
const Service = require("../models/service");
const User = require("../models/auth");

exports.createCompany = catchAsync(async (req, res, next) => {
  const { about, workHours, socialMedia } = req.body;
  const services = await Service.find({ company: req.user._id });
  const workers = await Team.find({ company: req.user._id });

  const user = await Company.findOne({ profile: req.user._id });
  if (user) {
    return next(new AppError("Company profile already exist", 400));
  }

  const response = await Company.create({
    about,
    profile: req.user._id,
    services,
    workHours,
    workers,
    socialMedia,
  });
  return res.status(201).json({
    status: "created",
    message: "company profile created",
    data: response,
  });
});

exports.getCompanies = catchAsync(async (req, res, next) => {
  const response = await User.find({ type: "company" });
  return res.status(200).json({
    status: "success",
    message: "companies datas fectched successfully",
    data: response,
  });
});

exports.getCompany = catchAsync(async (req, res, next) => {
  const response = await User.findOne({ type: "company", _id: req.params._id });
  return res.status(200).json({
    status: "success",
    message: "company datas fectched successfully",
    data: response,
  });
});
