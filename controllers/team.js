const Team = require("../models/team");
const User = require("../models/auth");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const {
  getData,
  deleteData,
  updateData,
  getDatasById,
} = require("../utils/factory");

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

  const workers = await Team.find({ company: req.user._id });

  const user = await User.findById(req.user._id);
  user.workers = workers;
  user.save({ validateBeforeSave: false });

  res.status(201).json({
    status: "created",
    message: "company worker added successfully",
    data,
  });
});

exports.getWorkers = getDatasById(Team, "company");

exports.updateWorker = updateData(Team, "worker");

exports.deleteWorker = deleteData(Team, "worker");

exports.getWorker = getData(Team);
