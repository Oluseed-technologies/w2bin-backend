const router = require("express").Router();
const {
  getBanks,
  createBankAccount,
  deleteAccount,
} = require("../controllers/wallet");
// const
const { protect, restrict } = require("../controllers/auth");

router.use(protect);
router.route("/banks").get(getBanks);
router.route("/bank-account").post(createBankAccount);
router.route("/bank-account/:_id").delete(deleteAccount);
module.exports = router;
