const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const FilterBody = require("../utils/FilterBody");
const Company = require("../models/company");
const Schedule = require("../models/schedule");
const { getData, getDatasById } = require("../utils/factory");

exports.createSchedule = catchAsync(async (req, res, next) => {
  const { currentLocation, type, state, address, description, lga } = req.body;
  const companies = await Company.findById(req.params._id).populate("Auth");
  console.log(companies);
  if (!companies) {
    return next(
      new AppError("This company does not exist or it's not activated yet", 400)
    );
  }

  const response = await Schedule.create({
    user: req.user._id,
    company: req.params._id,
    currentLocation,
    state: currentLocation ? req.user.state : state,
    address: currentLocation ? req.user.address : address,
    lga: currentLocation ? req.user.lga : lga,
    description,
    type,
  });
  return res.status(201).json({
    status: "created",
    message: "schedule successfully fixed",
    data: response,
  });
});

exports.getMySchedules = getDatasById(Schedule, "user");
exports.getCompanySchedules = getDatasById(Schedule, "company");

exports.updateSchedule = catchAsync(async (req, res, next) => {
  const schedule = await Schedule.find({
    user: req.user._id,
    _id: req.params._id,
  });
  console.log(schedule);
  if (schedule.length === 0) {
    return next(new AppError("This schedule does not exixt", 400));
  }
  const data = await Schedule.findByIdAndUpdate(req.params._id, req.body, {
    new: true,
    runValidators: true,
  });

  return res.status(200).json({
    status: "updated",
    message: "schedule updated successfully",
    data,
  });
});
