const router = require("express").Router();

// import the auth controllers
const { protect, restrict, lessRestriction } = require("../controllers/auth");
const {
  createCompany,
  //   getCompany,
  //   getCompanys,
  //   updateCompany,
  //   deleteCompany,
} = require("../controllers/company");

router.use(protect);
router.use(lessRestriction("company"));
router.route("/").post(createCompany);
// .get(getServices);
// router.route("/:_id").get(getService).put(updateService).delete(deleteService);

module.exports = router;
