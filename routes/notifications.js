const router = require("express").Router();

// import the auth controllers
const { protect, restrict, lessRestriction } = require("../controllers/auth");
const { createNotification } = require("../controllers/notifications");

router.use(protect);

router.route("/").post(createNotification);

module.exports = router;
