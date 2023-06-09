const router = require("express").Router();

// import the auth controllers
const {
  login,
  createAccount,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyEmail,
  protect,
  requestVerification,
} = require("../controllers/auth");

router.route("/login").post(login);
router.route("/signup").post(createAccount);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);
router.route("/verify-email").post(verifyEmail);
router.route("/request-email-verification").post(requestVerification);

router.route("/change-password").post(protect, changePassword);

module.exports = router;
