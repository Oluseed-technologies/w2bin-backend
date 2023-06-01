// modules import
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const AppError = require("./utils/AppError");

// custom files import
const app = require("./app");

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`server running at port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    throw new AppError(err.message, 500);
    console.log(err.message);
    process.exit(1);
  });
