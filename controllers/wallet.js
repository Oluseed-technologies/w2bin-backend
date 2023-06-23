const mongoose = require("mongoose");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { deleteData } = require("../utils/factory");

const Account = require("../models/accounts");
const User = require("../models/auth");
const Withdrawal = require("../models/withdrawal");

const axios = require("axios");

const { v4: uuidv4 } = require("uuid");

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

exports.initiateWithdrawal = catchAsync(async (req, res, next) => {
  const { accountNumber, amount } = req.body;
  console.log(req.user._id);
  if (!accountNumber || !amount)
    return next(
      new AppError("Please provide the account number and amount", 401)
    );

  const account = await Account.findOne({ accountNumber, user: req.user._id });
  if (!account)
    return next(new AppError("This account number is not added yet"));
  // {
  //   account_number: accountNumber,
  //   bank_code: account?.bankCode,
  // },
  const initiate = await axios.post(
    `${process.env.PAYSTACK_URL}/transferrecipient`,
    {
      account_number: accountNumber,
      bank_code: account?.bankCode,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_KEY}`,
      },
    }
  );
  // 000 000 000 0
  const uniqueID = uuidv4();
  console.log(initiate?.data?.data?.recipient_code);

  const reference = {
    source: "balance",
    reason: "Withdrawal",
    amount,
    reference: `withdrawal-${uniqueID}`,
    receipent: initiate?.data?.data?.recipient_code,
  };

  const transfer = await axios.post(
    `${process.env.PAYSTACK_URL}/transfer`,
    reference,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_KEY}`,
      },
    }
  );
  console.log(transfer);
  return res.status(200).json({
    status: "success",
    message: "Withdrawal initiated successfully",
    data: reference,
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

exports.withdrawalRequest = catchAsync(async (req, res, next) => {
  const response = await Withdrawal.find({ _id: req.user._id });
  return res.status(200).json({
    status: "success",
    message: "Withdrawal fetched successfully",
  });
});
