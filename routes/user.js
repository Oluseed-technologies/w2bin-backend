const router = require("express").Router();
// const { check } = require("express-validator/check");

// import the auth controllers
const { protect, restrict } = require("../controllers/auth");
const {
  getMyDetails,
  updateMyDetails,
  activateUserAccount,
  updateProfileImage,
  uploadImage,
  updateCoverImage,
} = require("../controllers/user");

router.use(protect);

router.route("/profile").get(getMyDetails).put(updateMyDetails);
router.route("/profile/image").put(uploadImage, updateProfileImage);
router
  .route("/profile/cover-image")
  .put(restrict("company"), uploadImage, updateCoverImage);
router.route("/activate-account").put(protect, activateUserAccount);

module.exports = router;
