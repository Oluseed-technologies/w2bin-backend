const router = require("express").Router();

const { protect, restrict, lessRestriction } = require("../controllers/auth");
const {
  createWorker,
  getWorkers,
  updateWorker,
  deleteWorker,
} = require("../controllers/team");

router.use(protect);
router.use(lessRestriction("company"));
router.route("/:id").put(updateWorker).delete(deleteWorker);
router.route("/").post(createWorker);
router.route("/").get(getWorkers);

module.exports = router;
