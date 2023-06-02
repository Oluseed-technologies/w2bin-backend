const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const Company = require("../models/company");
const User = require("../models/user");
const Team = require("../models/team");
const Service = require("../models/service");

exports.createCompany = catchAsync(async (req, res, next) => {
  const { about, workHours, socialMedia } = req.body;
  const workers = await Team.find({ company: req.user._id });
  const services = await Service.find({ company: req.user._id });

  const data = await Company.create({
    about,
    workHours,
    socialMedia,
    profile: req.user._id,
    workers,
    services,
  });
  return res.status(201).json({
    status: "created",
    message: "company account successfully activated",
    data,
  });
});
