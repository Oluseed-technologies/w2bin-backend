const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const FilterBody = require("../utils/FilterBody");
const Company = require("../models/company");
const Schedule = require("../models/schedule");
const Notification = require("../models/notifications");
const User = require("../models/auth");
const { getData, getDatasById } = require("../utils/factory");
const ApiFeatures = require("../utils/ApiFeature");

const { v4: uuidv4 } = require("uuid");
const Transaction = require("../models/transaction");
const Wallet = require("../models/wallet");

const siteData = require("../data.json");

const uniqueID = uuidv4();

exports.createSchedule = catchAsync(async (req, res, next) => {
  const { currentLocation, type, state, address, description, lga } = req.body;
  const companies = await User.findOne({
    _id: req.params._id,
    type: "company",
  });
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
// exports.getMySchedules = getDatasById(Schedule, "user");

exports.getSchedules = catchAsync(async (req, res, next) => {
  const data = Schedule.find({ [req.user.type]: req.user._id });
  const response = await new ApiFeatures(req.query, data).select().populate()
    .query;
  console.log(siteData.months[6]);
  const stats = await Schedule.aggregate([
    {
      $match: {
        $expr: {
          $eq: [{ $year: "$createdAt" }, 2023],
        },
      },
    },
    {
      $project: {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        status: "$status",
      },
    },
    {
      $group: {
        _id: {
          month: "$month",
          status: "$status",
        },

        total: { $sum: 1 },
      },
    },
  ]);
  // const stats = await Schedule.aggregate([
  //   {
  //     $match: {
  //       status: {
  //         $in: ["pending", "completed", "approved"],
  //       },
  //     },
  //   },
  //   {
  //     $project: {
  //       year: { $year: "$createdAt" },
  //       month: { $month: "$createdAt" },
  //       status: "$status",
  //       index: {
  //         $subtract: [{ $month: "$createdAt" }, 1],
  //       },
  //     },
  //   },
  //   {
  //     $addFields: {
  //       monthName: {
  //         $arrayElemAt: [siteData.months, "$index"],
  //       },
  //     },
  //   },
  //   {
  //     $group: {
  //       _id: "$status",
  //       month: {
  //         $push: "$monthName",
  //       },
  //       sum: { $sum: 1 },
  //       // $status: {
  //       //   $in: ["pending", "completed", "approved"],
  //       // },
  //     },
  //   },
  // ]);

  return res.status(200).json({
    status: "success",
    message: "schedules fetched successfully",
    // data: response,
    stats,
  });
});
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
    return next(new AppError("Operation denied by this company", 401));
  }
  if (data.status == "approved") {
    return next(
      new AppError(
        "This schedule is already approved by your client, to change the price please contact the admin"
      )
    );
  }
  const schedule = await Schedule.findByIdAndUpdate(
    data._id,
    { price: req.body.price },
    { new: true, runValidators: true }
  );

  // const response = await Notification.create({
  //   senderId: req.user._id,
  //   receiverIds: [data?.user],
  //   title: "Schedule price",
  //   message: `The price for the schedule is ${req.body.price}`,
  // });
  return res.status(200).json({
    status: "success",
    message: "schedule price sent fully",
    data: schedule,
  });
});

exports.updateStatus = catchAsync(async (req, res, next) => {
  console.log(req.user._id);
  console.log(req.params._id);

  const { status } = req.body;
  const data = await Schedule.findOne({
    user: req.user._id,
    _id: req.params._id,
  });

  if (!data) {
    return next(new AppError("Operation denied", 404));
  }

  if (!status) {
    return next(
      new AppError(
        "Please specify if you are marking the schedule as completed or you are deleting the schedule",
        401
      )
    );
  }
  // console.log(status );

  if (status !== "cancelled" && status !== "completed") {
    return next(
      new AppError(`You are not allowed to mark this schedule as ${status}`)
    );
  }
  if (status === "cancelled") {
    return res.status(200).json({
      status: "success",
      data: "scheduled cancelled successfully",
    });
  }

  if (data.status === "completed")
    return next(
      new AppError("This schedule has already been mark as completed", 401)
    );
  const transaction = await Transaction.findOne({
    user: req.user._id,
    schedule: req.params._id,
    status: "success",
  });

  if (!transaction) {
    return next(
      new AppError(
        "This status cannot be mark as completed yet, please proceed with the payment first"
      )
    );
  }
  // if(status === 'completed')

  const response = await Schedule.findByIdAndUpdate(
    data?._id,
    {
      status,
    },
    { new: true, runValidators: true }
  );
  const wallet = await Wallet.findOne({ owner: response.company });

  wallet.non_withdrawable_amount =
    wallet.non_withdrawable_amount - response.price;

  wallet.withdrawable_amount = wallet.withdrawable_amount + response.price;
  wallet.total_amount =
    wallet.non_withdrawable_amount + wallet.withdrawable_amount;

  wallet.save({ runValidators: true });

  return res.status(200).json({
    status: "updated",
    message: `This schedule has been successfully ${req.body.status}`,
    response,
  });
});
