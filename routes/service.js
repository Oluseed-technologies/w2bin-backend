const router = require("express").Router();

// import the auth controllers
const { protect, restrict } = require("../controllers/auth");
const { createService, getService } = require("../controllers/service");

router.use(protect);
router.use(restrict("super-admin", "user", "company"));
router.route("/:id").post(createService);
router.route("/").get(getService);

module.exports = router;
