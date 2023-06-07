const router = require("express").Router();
// const { check } = require("express-validator/check");

// import the auth controllers
const { protect, restrict } = require("../controllers/auth");
const {
  getMyDetails,
  updateMyDetails,
  activateUserAccount,
} = require("../controllers/user");

router.use(protect);

router.route("/profile").get(getMyDetails).put(updateMyDetails);
router.route("/activate-account").put(protect, activateUserAccount);

module.exports = router;
