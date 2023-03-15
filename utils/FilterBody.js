const FilterBody = (passedData, restrictedData) => {
  const obj = { ...passedData };

  restrictedData.forEach((el) => delete obj[el]);
  return obj;
};

module.exports = FilterBody;
