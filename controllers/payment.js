const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const app = require("../app");
const Schedule = require("../models/schedule");

const { v4: uuidv4 } = require("uuid");

const uniqueID = uuidv4();

const Transaction = require("../models/transaction");

exports.generateReference = catchAsync(async (req, res, next) => {
  const { purpose, amount } = req.body;
  const reference = await Transaction.create({
    purpose,
    amount,
    reference: `${purpose}-${uniqueID}`,
    user: req.user._id,
  });
  return res.status(200).json({
    status: "success",
    message: "Transaction reference generated successfully",
    data: reference,
  });
});
