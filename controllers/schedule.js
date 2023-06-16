const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const FilterBody = require("../utils/FilterBody");
const Company = require("../models/company");
const Schedule = require("../models/schedule");
const Notification = require("../models/notifications");
const User = require("../models/auth");
const { getData, getDatasById } = require("../utils/factory");

const { v4: uuidv4 } = require("uuid");

const uniqueID = uuidv4();

exports.createSchedule = catchAsync(async (req, res, next) => {
  const { currentLocation, type, state, address, description, lga } = req.body;
  const companies = await User.findById(req.params._id);
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

// exports.getSchedule = catchAs
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

exports.sendSchedulePrice = catchAsync(async (req, res, next) => {
  if (!req.body.price) {
    return next(new AppError("Please provide a price", 401));
  }
  const data = await Schedule.findOne({
    company: req.user._id,
    _id: req.params._id,
  });
  console.log(data);
  if (!data) {
    return next(new AppError("This schedule is not available", 401));
  }
  const schedule = await Schedule.findByIdAndUpdate(
    data._id,
    { price: req.body.price },
    { new: true, runValidators: true }
  );

  const response = await Notification.create({
    senderId: req.user._id,
    receiverIds: [data?.user],
    title: "Schedule price",
    message: `The price for the schedule is ${req.body.price}`,
  });
  return res.status(200).json({
    status: "success",
    message: "details price sent fully",
    data: response,
    schedule,
  });
});

exports.updateStatus = catchAsync(async (req, res, next) => {
  console.log(req.user._id);
  console.log(req.params._id);
  const data = await Schedule.findOne({
    user: req.user._id,
    _id: req.params._id,
  });
  if (!data) {
    return next(new AppError("This schedule does not exist", 404));
  }
  if (!data.price) {
    return next(
      new AppError(
        "The service price is not provided yet, the price will soon be updated",
        400
      )
    );
  }
  if (!req.body.status) {
    return next(new AppError("Please provide the schedule status", 401));
  }
  const response = await Schedule.findByIdAndUpdate(
    data?._id,
    {
      status: req.body.status,
      token: uniqueID,
    },
    { new: true, runValidators: true }
  );
  return res.status(200).json({
    status: "updated",
    message: `This schedule has been successfully ${req.body.status}`,
    response,
  });
});
