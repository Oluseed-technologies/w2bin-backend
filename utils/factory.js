const catchAsync = require("./catchAsync");
const AppError = require("./AppError");

exports.getAllDatas = (Model) => {
  return catchAsync(async (req, res, next) => {
    const data = await Model.find();
    // const response = await new ApiFeatures(req.query, user).select();

    res.status(200).json({
      status: "success",
      message: " datas feteched succesfully",
      data,
    });
  });
};

exports.getDatasById = (Model, key) => {
  return catchAsync(async (req, res, next) => {
    const data = await Model.find({ [key]: req.user._id });
    // const response = await new ApiFeatures(req.query, user).select();

    res.status(200).json({
      status: "success",
      message: " datas feteched succesfully",
      data,
    });
  });
};

exports.getData = (Model) => {
  return catchAsync(async (req, res, next) => {
    const { _id } = req.params;
    const data = await Model.findById(_id);
    // const response = await new ApiFeatures(req.query, user).select();

    res.status(200).json({
      status: "success",
      message: " data feteched succesfully",
      data,
    });
  });
};

exports.deleteData = (Model, type) => {
  return catchAsync(async (req, res, next) => {
    const { _id } = req.params;
    const data = await Model.findOne({ _id });
    if (!data) return next(new AppError(`${type} does not exist`, 400));
    const response = await Model.findByIdAndDelete(_id);

    return res.status(200).json({
      status: "updated",
      message: `${type} successfully deleted`,
    });
  });
};

exports.updateData = (Model, type) => {
  return catchAsync(async (req, res, next) => {
    const { _id } = req.params;
    console.log(_id);
    const exist = await Model.findOne({ _id });
    if (!exist) return next(new AppError(`This ${type} does not exist`));
    const response = await Model.findByIdAndUpdate(_id, req.body, {
      runValidators: true,
    });
    const data = await Model.findById(response._id);
    return res.status(200).json({
      status: "updated",
      message: ` ${type} successfully updated`,
      data,
    });
  });
};
