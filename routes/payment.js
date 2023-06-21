const router = require("express").Router();

// import the auth controllers
const { protect, restrict } = require("../controllers/auth");
const {
  generateReference,
  getTransactions,
  verifyPayment,
} = require("../controllers/payment");

router.use(protect);

router.route("/reference").post(generateReference);
router.route("/verify/:id").get(verifyPayment);
router.route("/").get(getTransactions);

module.exports = router;
