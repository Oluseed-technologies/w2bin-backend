const router = require("express").Router();

// import the auth controllers
const { protect, restrict } = require("../controllers/auth");
const { generateReference } = require("../controllers/payment");

router.use(protect);

router.route("/").get(generateReference);

module.exports = router;
