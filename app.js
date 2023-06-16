// installed modules export
const express = require("express");
const bodyParser = require("body-parser");

// import routes
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const adminRoute = require("./routes/admin");
const serviceRoute = require("./routes/service");
const teamRoute = require("./routes/team");
const companyRoute = require("./routes/company");
const scheduleRoute = require("./routes/schdedule");
const notificationRoute = require("./routes/notifications");
const paymentRoute = require("./routes/payment");

const admin = require("firebase-admin");
const serviceAccount = require("./w2bin.json");

// custom files import

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

exports.instance = () => {
  const fcm = admin.messaging();
  return fcm;
};

// Error handlers
const AppError = require("./utils/AppError");
const GlobalError = require("./controllers/error");

const app = express();

// middleware to  pass all incoming data request
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH ");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    // Respond with 200 OK status code
    res.sendStatus(200);
  } else {
    // Continue to the next middleware for other requests
    next();
  }
  // next();
});

app.use(`${process.env.BASE_URL}/auth`, authRoute);
app.use(`${process.env.BASE_URL}/user`, userRoute);
app.use(`${process.env.BASE_URL}/admin`, adminRoute);
app.use(`${process.env.BASE_URL}/notification`, notificationRoute);
app.use(`${process.env.BASE_URL}/company`, companyRoute);
app.use(`${process.env.BASE_URL}/payment`, paymentRoute);
app.use(`${process.env.BASE_URL}/company/team`, teamRoute);
app.use(`${process.env.BASE_URL}/schedule`, scheduleRoute);
app.use(`${process.env.BASE_URL}/company/service`, serviceRoute);

app.all("*", (req, res, next) => {
  const error = new AppError("route not found", 404);
  // error.statusCode = 404
  next(error);
});

app.use(GlobalError);

module.exports = app;
