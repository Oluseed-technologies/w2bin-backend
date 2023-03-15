class ApiFeatures {
  constructor(queryObj, query) {
    this.queryObj = queryObj;
    this.query = query;
  }
  select() {
    if (this.queryObj.select) {
      return this.query.select(this.queryObj.select);
    }
    return this.query;
  }
}
module.exports = ApiFeatures;
