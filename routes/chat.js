const router = require("express").Router();

// import the auth controllers
const { sendMessage, initiateChat } = require("../controllers/chat");
const { protect } = require("../controllers/auth");

router.use(protect);
router.route("/").post(sendMessage);
router.route("/initiate/:_id").get(initiateChat);

module.exports = router;
