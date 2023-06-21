const router = require("express").Router();

// import the auth controllers
const { protect, restrict, lessRestriction } = require("../controllers/auth");
const {
  createSchedule,
  getSchedules,
  updateSchedule,
  sendSchedulePrice,
  updateStatus,
} = require("../controllers/schedule");

router.use(protect);

router.route("/:_id").post(createSchedule).put(updateSchedule);
router.route("/").get(getSchedules);

router.route("/status/:_id").post(updateStatus);

router.use(restrict("company"));

router.route("/price/:_id").post(sendSchedulePrice);

module.exports = router;
