const router = require("express").Router();

// import the auth controllers
const { protect, restrict, lessRestriction } = require("../controllers/auth");
const {
  createCompany,
  getCompanies,
  getCompany,
  //   getCompanys,
  //   updateCompany,
  //   deleteCompany,
} = require("../controllers/company");

router.use(protect);
router
  .route("/")
  .post(lessRestriction("company"), createCompany)
  .get(getCompanies);

router.route("/:_id").get(getCompany);
// .get(getServices);
// router.route("/:_id").get(getService).put(updateService).delete(deleteService);

module.exports = router;
