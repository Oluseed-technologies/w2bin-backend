const Team = require("../models/team");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

exports.createWorker = catchAsync(async (req, res, next) => {
  const { role, firstName, lastName } = req.body;
  const worker = await Team.findOne({ role, lastName, firstName });
  console.log(worker);
  if (worker) {
    return next(
      new AppError("This company worker has already been added", 400)
    );
  }
  const data = await Team.create({
    role,
    firstName,
    lastName,
    company: req.user._id,
  });

  res.status(201).json({
    status: "created",
    message: "company worker added successfully",
    data,
  });
});

exports.getWorkers = catchAsync(async (req, res, next) => {
  const data = await Team.find({ company: req.user._id });
  res.status(200).json({
    status: "success",
    message: "Company workers successfully fetched",
    data,
  });
});

exports.updateWorker = catchAsync(async (req, res, next) => {
  const { id: _id } = req.params;
  const data = await Team.findOne({ _id });
  if (!data) return next(new AppError("This worker does not exist"));
  const response = await Team.findByIdAndUpdate(_id, req.body, {
    runValidators: true,
  });
  const worker = Team.findById(response._id);
  return res.status(200).json({
    status: "updated",
    message: "worker detail successfully updated",
    data,
  });
});

exports.deleteWorker = catchAsync(async (req, res, next) => {
  const { id: _id } = req.params;
  const data = await Team.findOne({ _id });
  if (!data) return next(new AppError("This worker does not exist"));
  const response = await Team.findByIdAndDelete(_id);

  return res.status(200).json({
    status: "updated",
    message: "worker  successfully removed",
  });
});
