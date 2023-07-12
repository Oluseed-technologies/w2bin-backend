class ApiFeatures {
  page = 1;
  constructor(queryObj, query) {
    this.queryObj = queryObj;
    this.query = query;
  }
  filter() {
    const queryObj = { ...this.queryObj };
    // excluded fields
    const excludedFields = ["limit", "page", "fields", "sort"];

    // FILTERING
    excludedFields.forEach((data) => delete queryObj[data]);
    let queryStr = JSON.stringify(queryObj);

    queryStr = JSON.parse(
      queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)
    );
    this.query = this.query.find(queryStr);
    return this;
  }
  select() {
    console.log(this.page);
    if (!this.queryObj.select) {
      this.query = this.query.select("-__v -bankAccounts");
      return this;
    }
    this.query = this.query.select(this.queryObj.select);
    return this;
  }
  paginate() {
    this.page = +this.queryObj.page || this.page;
    const limit = +this.queryObj.limit || 2;
    const skip = (this.page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
  sort() {
    if (this.queryObj.sort) {
      this.query = this.query.sort(this.queryObj.sort.split(",").join(" "));
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }
  FieldLimit() {
    // Field Limiting
    if (this.queryObj.fields) {
      this.query = this.query.select(
        `+${this.queryObj.fields.split(",").join(" ")}`
      );
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }
  populate() {
    if (!this.queryObj._populate) {
      return this;
    }
    this.query = this.query.populate(this.queryObj._populate);
    return this;
  }
}
module.exports = ApiFeatures;
