const router = require("express").Router();

// import the auth controllers
const { protect, restrict, lessRestriction } = require("../controllers/auth");
const {
  createService,
  getService,
  getServices,
  updateService,
  deleteService,
} = require("../controllers/service");

router.use(protect);
router.use(lessRestriction("company"));
router.route("/").post(createService).get(getServices);
router.route("/:_id").get(getService).put(updateService).delete(deleteService);

module.exports = router;
