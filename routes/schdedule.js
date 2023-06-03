const router = require("express").Router();

// import the auth controllers
const { protect, restrict, lessRestriction } = require("../controllers/auth");
const {
  createSchedule,
  getMySchedules,
  updateSchedule,
  getCompanySchedules,
} = require("../controllers/schedule");

router.use(protect);

router
  .route("/:_id")
  .post(restrict("user"), createSchedule)
  .put(restrict("user"), updateSchedule);
router.route("/").get(restrict("user"), getMySchedules);

router.use(restrict("company"));
router.route("/company").get(getCompanySchedules);
// .get(getServices);
// router.route("/:_id").get(getService).put(updateService).delete(deleteService);

module.exports = router;
