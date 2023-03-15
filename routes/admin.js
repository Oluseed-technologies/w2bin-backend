const router = require("express").Router();

// import the auth controllers
const { protect, restrict } = require("../controllers/auth");
const { getUsers, updateUserStatus } = require("../controllers/admin");

router.use(protect);
router.use(restrict("super-admin"));
router.route("/users").get(getUsers);
router.route("/users/:id").put(updateUserStatus);

module.exports = router;
