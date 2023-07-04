const router = require("express").Router();

// import the auth controllers
const { protect, restrict, lessRestriction } = require("../controllers/auth");
const {
  createCompany,
  getCompanies,
  getCompany,
} = require("../controllers/company");

router.use(protect);
router
  .route("/")
  .post(lessRestriction("company"), createCompany)
  .get(getCompanies);

router.route("/:_id").get(getCompany);

module.exports = router;
