const AppError = require("../utils/AppError");
const FilterBody = require("../utils/FilterBody");
const lodash = require("lodash");

// model import
const User = require("../models/user");
const Service = require("../models/service");
const Company = require("../models/company");

// async function wrapper import
const catchAsync = require("../utils/catchAsync");

exports.createService = catchAsync(async (req, res, next) => {
  delete req.body.status;
  req.body.user = req.user._id;
  req.body.company = req.params.id;
  const checkCompany = await Company.findById(req.params.id);

  if (!checkCompany) {
    return next(
      new AppError("The company with this service does not exist anymore")
    );
  }
  const checkService = checkCompany.services
    .map((data) => {
      return { price: data.price, name: data.name };
    })
    .find((data) => {
      return lodash.isEqual(data, req.body.service);
    });
  if (!req.body.service) {
    return next(new AppError("Service is required", 409));
  }

  if (!checkService) {
    return next(
      new AppError("This company does not render the specified service", 422)
    );
  }
  console.log(checkService);

  const service = await Service.create(req.body);
  res.status(201).json({
    status: "created",
    message: "service created successfully",
    data: service,
  });
});

exports.getService = catchAsync(async (req, res, next) => {
  const services = await Service.find({ user: req.user._id });
  const stats = await Service.aggregate([
    {
      $match: { user: { $eq: req.user._id } },
    },

    {
      $lookup: {
        from: "companies",
        localField: "company",
        foreignField: "_id",
        as: "company",
      },
    },
    {
      $unwind: "$company",
    },
    {
      $project: { "company.profile": 1, status: 1, budget: 1, service: 1 },
    },
    {
      $lookup: {
        from: "users",
        localField: "company.profile",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $project: { "user.companyName": 1, status: 1, budget: 1, service: 1 },
    },

    {
      $group: {
        _id: "$user.companyName",
        totalBudget: { $sum: "$budget" },
        totalPrice: { $sum: "$service.price" },
        totalServices: { $sum: 1 },
      },
    },
  ]);
  res.status(200).json({
    status: "success",
    message: "services fetched successfully",
    data: {
      services,
      stats,
    },
  });
});
