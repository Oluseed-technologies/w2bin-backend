const router = require("express").Router();

const { protect, restrict, lessRestriction } = require("../controllers/auth");
const {
  createWorker,
  getWorkers,
  updateWorker,
  deleteWorker,
  getWorker,
} = require("../controllers/team");

router.use(protect);
router.use(lessRestriction("company"));
router.route("/:_id").put(updateWorker).delete(deleteWorker).get(getWorker);
router.route("/").post(createWorker);
router.route("/").get(getWorkers);

module.exports = router;
