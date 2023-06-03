const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const Company = require("../models/company");
const Team = require("../models/team");
const Service = require("../models/service");

exports.createCompany = catchAsync(async (req, res, next) => {
  const { socialMedia, about, workHours } = req.body;
  const user = await Company({ profile: req.user._id });
  console.log(user);
  if (user) return next(new AppError("company profile already exist", 400));

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
  console.log(data);
  return res.status(201).json({
    status: "created",
    message: "company account successfully activated",
    data,
  });
});
