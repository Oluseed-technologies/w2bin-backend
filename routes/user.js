const router = require("express").Router();

// import the auth controllers
const { protect, restrict } = require("../controllers/auth");
const {
  getMyDetails,
  updateMyDetails,
  updateCompanyProfile,
  createCompanyProfile,
  getCompanyProfile,
} = require("../controllers/user");

router.use(protect);

router.route("/profile").get(getMyDetails).put(updateMyDetails);
router
  .route("/company/profile")
  .post(restrict("company"), createCompanyProfile)
  .get(restrict("company"), getCompanyProfile)
  .put(restrict("company"), updateCompanyProfile);

module.exports = router;
