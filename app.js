// installed modules export
const express = require("express");
const bodyParser = require("body-parser");

// import routes
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const adminRoute = require("./routes/admin");
const serviceRoute = require("./routes/service");

// Error handlers
const AppError = require("./utils/AppError");
const GlobalError = require("./controllers/error");

const app = express();

// middleware to  pass all incoming data request
app.use(bodyParser.json());

app.use(`${process.env.BASE_URL}/auth`, authRoute);
app.use(`${process.env.BASE_URL}/user`, userRoute);
app.use(`${process.env.BASE_URL}/admin`, adminRoute);
app.use(`${process.env.BASE_URL}/user/service`, serviceRoute);

app.all("*", (req, res, next) => {
  const error = new AppError("route not found", 404);
  // error.statusCode = 404
  next(error);
});

app.use(GlobalError);

module.exports = app;
