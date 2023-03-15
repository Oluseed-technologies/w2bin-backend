const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const ApiFeatures = require("../utils/ApiFeature");
const FilterBody = require("../utils/FilterBody");

const User = require("../models/user");
const Company = require("../models/company");

const checkBeforeUpdate = (res, data, body, next) => {
  const check_data = data?.filter((data) => {
    const service = body.map((data) => {
      return data.name;
    });
    const names = service.includes(data.name);
    return names;
  });

  if (check_data.length !== 0) {
    const unique_set = [
      ...new Set(
        check_data.map((data) => {
          return data.name;
        })
      ),
    ].join(",");
    console.log(unique_set);
    return next(
      new AppError(`${unique_set}: services(s) is already available `)
    );
  }

  return "success";

  //   res.status(200).json({
  //     status: "updated",
  //     message: "Company Profile Successfully Updated",
  //     // data: company,
  //   });
};

// select
exports.getMyDetails = catchAsync(async (req, res, next) => {
  const user = User.findById(req.user._id);
  const response = await new ApiFeatures(req.query, user).select();

  res.status(200).json({
    status: "success",
    message: "user data feteched succesfully",
    data: response,
  });
});

exports.updateMyDetails = catchAsync(async (req, res, next) => {
  const { password, confirmPassword } = req.body;

  if (password || confirmPassword) {
    return next(
      new AppError(
        "Please use the update password endpoint to update your password",
        401
      )
    );
  }

  const data = FilterBody(req.body, [
    "emailVerified",
    "status",
    "resetToken",
    "resetTokenExpire",
  ]);
  console.log(data);
  const response = await User.findByIdAndUpdate(req.user._id, data, {
    runValidators: true,
  });

  const user = await User.findById(response._id);

  res.status(200).json({
    status: "success",
    message: "User Profile  updated succesfully",
    data: user,
  });
});

exports.createCompanyProfile = catchAsync(async (req, res, next) => {
  const data = FilterBody(req.body, ["profile", "ratings"]);

  const checkCompany = await Company.findOne({ profile: req.user._id });

  if (checkCompany) {
    await Company.findByIdAndDelete(checkCompany._id);
  }

  data.profile = req.user._id;
  if (!data.services || data.services.length == 0) {
    return next(new AppError("A company must have atleast a service", 422));
  }

  const company = await Company.create(data);
  res.status(201).json({
    status: "created",
    message: "Company Profile Successfully created",
    data: company,
  });
});

exports.updateCompanyProfile = catchAsync(async (req, res, next) => {
  const company = await Company.findOne({ profile: req.user._id });

  if (!company) {
    return next(new AppError("No services added yet", 422));
  }
  const data = FilterBody(req.body, ["profile", "ratings"]);

  const service = checkBeforeUpdate(
    res,
    company.services,
    req.body.services || [],
    next
  );

  const removeWorkersId = company.workers
    .map((data) => {
      return { name: data.name, role: data.role };
    })
    .filter((data) => {
      return (
        JSON.stringify(data) ===
        JSON.stringify({ name: "adekola", role: "cleaner" })
      );
    });

  let value = undefined;
  if (req.body.workers && !Array.isArray(req.body.workers)) {
    return next(new AppError(`Workers details should be in an array`, 409));
  }
  removeWorkersId.forEach((item) => {
    req.body.workers.forEach((data) => {
      if (JSON.stringify(data) === JSON.stringify(item)) {
        value = item;
      }
    });
  });

  if (value !== undefined) {
    return next(
      new AppError(
        `The worker with name : ${value.name} and role : ${value.role} already exist`,
        409
      )
    );
  }
  data.services = [...company.services, ...(req.body.services || [])];
  data.workers = [...company.workers, ...(req.body.workers || [])];

  const response = await Company.findByIdAndUpdate(company._id, data, {
    runValidators: true,
    new: true,
  });

  if (service === "success") {
    return res.status(200).json({
      status: "updated",
      message: "Company Profile Successfully Updated",
      data: response,
    });
  }
});

exports.getCompanyProfile = catchAsync(async (req, res, next) => {
  const response = await Company.findOne({ profile: req.user._id }).populate(
    "profile"
  );
  res.status(200).json({
    status: "success",
    message: "Company Profile Fetched successfully",
    data: response,
  });
});
