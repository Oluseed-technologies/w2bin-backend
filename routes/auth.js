const router = require("express").Router();

// import the auth controllers
const {
  login,
  createAccount,
  forgotPassword,
  resetPassword,
  changePassword,
  protect,
} = require("../controllers/auth");

router.route("/login").post(login);
router.route("/signup").post(createAccount);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);

router.route("/change-password").post(protect, changePassword);

module.exports = router;
