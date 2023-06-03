const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const Company = require("../models/company");
const Team = require("../models/team");
const Service = require("../models/service");

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
