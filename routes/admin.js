const router = require("express").Router();

// import the auth controllers
const { protect, restrict } = require("../controllers/auth");
const {
  getUsers,
  updateUserStatus,
  fetchSchedules,
} = require("../controllers/admin");
const { route } = require("./user");

router.use(protect);
router.use(restrict("super-admin"));
router.route("/users").get(getUsers);
router.route("/users/:_id").put(updateUserStatus);
router.route("/schedules").get(fetchSchedules);
module.exports = router;
