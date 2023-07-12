const router = require("express").Router();

// import the auth controllers
const { protect, restrict, lessRestriction } = require("../controllers/auth");
const {
  createNotification,
  getNotifications,
} = require("../controllers/notifications");

router.use(protect);

router.route("/").post(createNotification);
router.route("/").get(getNotifications);

module.exports = router;
