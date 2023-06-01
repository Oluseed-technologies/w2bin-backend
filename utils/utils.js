const validator = require("validator");

exports.capitalize = (value = "") => {
  return `${value.toString().split("")[0].toUpperCase()}${value.slice(1)}`;
};
exports.GenerateOtp = () => {
  const token = Math.floor(10000000 + Math.random() * 90000000);
  const expire = Date.now() + 10 * 60 * 10000;
  return { token, expire };
};

exports.validateNumber = (data) => {
  return validator.isMobilePhone(data, "en-NG");
};
