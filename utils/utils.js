const validator = require("validator");

exports.capitalize = (value = "") => {
  return `${value.toString().split("")[0].toUpperCase()}${value.slice(1)}`;
};
exports.GenerateOtp = () => {
  const timestamp = Date.now().toString();
  const randomNum = Math.floor(Math.random() * 1000000);
  const token = (timestamp + randomNum).slice(-6);
  const expire = Date.now() + 10 * 60 * 10000;
  return { token, expire };
};

exports.validateNumber = (data) => {
  return validator.isMobilePhone(data, "en-NG");
};
