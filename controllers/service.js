const AppError = require("../utils/AppError");
const {
  getData,
  getDatasById,
  updateData,
  deleteData,
} = require("../utils/factory");

// model import
const User = require("../models/auth");
const Service = require("../models/service");
const Company = require("../models/company");

// async function wrapper import
const catchAsync = require("../utils/catchAsync");

exports.createService = catchAsync(async (req, res, next) => {
  const { name, description, price } = req.body;
  const response = await Service.create({
    name,
    description,
    price,
    company: req.user._id,
  });
  return res.status(201).json({
    status: "created",
    message: "Service created successfully",
  });
});

exports.getService = getData(Service);
exports.updateService = updateData(Service, "service");
exports.deleteService = deleteData(Service, "service");
exports.getServices = getDatasById(Service, "company");
