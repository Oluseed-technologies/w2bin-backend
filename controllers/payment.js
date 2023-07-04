const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const app = require("../app");

const { v4: uuidv4 } = require("uuid");

const axios = require("axios");

const Transaction = require("../models/transaction");
const User = require("../models/auth");
const Schedule = require("../models/schedule");

const { getDatasById } = require("../utils/factory");
const ApiFeatures = require("../utils/ApiFeature");
const Wallet = require("../models/wallet");

exports.generateReference = catchAsync(async (req, res, next) => {
  const { purpose, schedule } = req.body;
  const uniqueID = uuidv4();
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

  const reference = await Transaction.create({
    schedule,
    purpose,
    amount: data?.price,
    reference: `${purpose}-${uniqueID}`,
    user: req.user._id,
    company: data?.company,
  });
  console.log(reference);
  return res.status(200).json({
    status: "success",
    message: "Payment initiated, proceed to make your payment",
    data: reference,
  });
});

exports.verifyPayment = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const findTransaction = await Transaction.findOne({
    reference: id,
    user: req.user._id,
    purpose: "Payment",
  });

  if (!id) {
    return next(new AppError("Please provide the transaction reference"));
  }
  if (!findTransaction) {
    return next(new AppError("operation denied for this user", 401));
  }

  const response = await axios.get(
    `${process.env.PAYSTACK_URL}/transaction/verify/${id}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_KEY}`,
      },
    }
  );

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
      const schedule = await Schedule.findOne(data.schedule);
      schedule.status = "approved";
      schedule.save({ runValidators: true });

      const wallet = await Wallet.findOne({ owner: schedule.company });
      if (!wallet) {
        const createWallet = await Wallet.create({
          owner: company.company,
          non_withdrawable_amount: response.data.data.amount,
          total_amount: response.data.data.amount,
        });
        const user = await User.findOneAndUpdate(
          { _id: schedule.company },
          { wallet: createWallet._id }
        );
      } else {
        const updateWallet = await Wallet.findOneAndUpdate(
          { owner: schedule.company },
          {
            non_withdrawable_amount:
              wallet.non_withdrawable_amount + response.data.data.amount,
            total_amount:
              wallet.non_withdrawable_amount + response.data.data.amount,
          },
          {
            new: true,
          }
        );
      }
      console.log(schedule);

      return res.status(200).json({
        status: "success",
        message: "Payment successfully made",
        data: schedule,
      });
    }
  }

  return next(new AppError("Payment not successful", 401));
});

exports.getTransactions = catchAsync(async (req, res, next) => {
  const response = await Transaction.find({ [req.user.type]: req.user._id });
  return res.status(200).json({
    status: "success",
    message: "Transactions data fetch successfully",
    data: response,
  });
});
