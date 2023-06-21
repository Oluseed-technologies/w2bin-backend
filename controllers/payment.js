const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const app = require("../app");
const Schedule = require("../models/schedule");

const { v4: uuidv4 } = require("uuid");

const axios = require("axios");

const Transaction = require("../models/transaction");
const { rest } = require("lodash");

const { getDatasById } = require("../utils/factory");

exports.generateReference = catchAsync(async (req, res, next) => {
  const { purpose, amount, schedule } = req.body;
  if (!schedule) {
    return next(new AppError("Please provide the ID of the schedule"));
  }
  const data = await Schedule.findOne({ user: req.user._id, _id: schedule });
  if (!data) {
    return next(
      new AppError("This user is restricted to perform this operation", 401)
    );
  }

  const transaction = await Transaction.findOne({
    schedule: data._id,
    status: "success",
  });
  console.log(transaction);
  if (transaction?.price) {
    return next(new AppError("You have already paid for this schedule", 400));
  }
  if (!data.price) {
    return next(new AppError("The price is not fixed yet"));
  }

  const uniqueID = uuidv4();
  const reference = await Transaction.create({
    schedule,
    purpose,
    amount,
    reference: `${purpose}-${uniqueID}`,
    user: req.user._id,
  });
  return res.status(200).json({
    status: "success",
    message: "Payment initiated, proceed to make your payment",
    data: reference,
  });
});

exports.verifyPayment = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new AppError("Please provide the transaction reference"));
  }

  const response = await axios.get(
    `https://api.paystack.co/transaction/verify/${id}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_KEY}`,
      },
    }
  );

  console.log(response?.data);
  if (response?.data?.status) {
    const data = await Transaction.findOneAndUpdate(
      {
        reference: id,
      },
      {
        status: response?.data?.data?.status === "success" ? "success" : "fail",
      },
      { new: true }
    );
    if (response?.data?.data?.status === "success") {
      // const company = Schedule.findOne()
      console.log("yeah");
    }
  }

  return res.status(200).json({
    status: "success",
    message: "Transaction successfully verified",
  });
});

exports.getTransactions = getDatasById(Transaction, "user");
