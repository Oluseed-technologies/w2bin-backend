const router = require("express").Router();

// import the auth controllers
const { sendMessage } = require("../controllers/chat");
const { protect } = require("../controllers/auth");

router.use(protect);
router.route("/").post(sendMessage);

module.exports = router;
