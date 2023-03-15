// modules import
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

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
    console.log(err.message);
  });
