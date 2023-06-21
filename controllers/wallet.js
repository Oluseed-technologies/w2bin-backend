const mongoose = require("mongoose");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { deleteData } = require("../utils/factory");

const Account = require("../models/accounts");
const User = require("../models/auth");

const axios = require("axios");

exports.createBankAccount = catchAsync(async (req, res, next) => {
  const { accountNumber, bankCode } = req.body;
  if (!accountNumber)
    next(new AppError("Please provide the account Number", 401));
  if (!bankCode) next(new AppError("Please provide the Bank code", 401));

  const findBank = await Account.findOne({ user: req.user._id, accountNumber });

  if (findBank)
    next(new AppError("This bank detail is already added to an account"));

  const response = await axios.get(
    `${process.env.PAYSTACK_URL}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_KEY}`,
      },
    }
  );

  const banks = await axios.get("https://api.paystack.co/bank?currency=NGN", {
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_KEY}`,
    },
  });

  const bank = banks?.data?.data?.find((data, index) => {
    return data?.id === response.data.data.bank_id;
  });

  const data = await Account.create({
    accountNumber,
    bankCode,
    user: req.user._id,
    bankName: bank?.name,
    accountName: response?.data?.data?.account_name,
  });

  const accounts = await Account.find({ user: req.user._id }).select("+ _id");
  const accountIds = accounts?.map((data, index) => {
    return data?._id;
  });
  console.log(accountIds);

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { bankAccounts: accountIds },
    { new: true }
  );
  console.log(user);
  return res.status(201).json({
    status: "success",
    message: "Bank Account updated successfully",
  });
});

exports.getBanks = catchAsync(async (req, res, next) => {
  const data = await axios.get("https://api.paystack.co/bank?currency=NGN", {
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_KEY}`,
    },
  });

  console.log(data);

  return res.status(200).json({
    status: "success",
    message: "banks fetched successfully",
    data: data.data,
  });
});

exports.deleteAccount = catchAsync(async (req, res, next) => {
  const account = await Account.findOneAndDelete({
    _id: req.params._id,
    user: req.user._id,
  });
  if (!account) return next(new AppError("operation denied"));

  const accounts = await Account.find({ user: req.user._id }).select("+ _id");
  const accountIds = accounts?.map((data, index) => {
    return data?._id;
  });
  console.log(accountIds);

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { bankAccounts: accountIds },
    { new: true }
  );

  return res.status(200).json({
    status: "success",
    nessage: "bank account deleted successfully",
  });
});
