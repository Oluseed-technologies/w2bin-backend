const router = require("express").Router();
const {
  getBanks,
  createBankAccount,
  deleteAccount,
  initiateWithdrawal,
} = require("../controllers/wallet");
// const
const { protect, restrict } = require("../controllers/auth");

router.use(protect);
router.use(restrict("company", "super-admin"));
router.route("/banks").get(getBanks);
router.route("/withdrawal").post(initiateWithdrawal);
router.route("/bank-account").post(createBankAccount);
router.route("/bank-account/:_id").delete(deleteAccount);
module.exports = router;
