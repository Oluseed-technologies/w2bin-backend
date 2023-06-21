const FilterBody = (
  passedData,
  restrictedData = [
    "emailVerified",
    "status",
    "resetToken",
    "resetTokenExpire",
    "token",
    "tokenExpire",
    "bankAccounts",
    "wallet",
  ]
) => {
  const obj = { ...passedData };

  restrictedData.forEach((el) => delete obj[el]);
  return obj;
};

module.exports = FilterBody;
