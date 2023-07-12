const router = require("express").Router();

// import the auth controllers
const { sendMessage, getChats, initiateChat } = require("../controllers/chat");
const { protect } = require("../controllers/auth");

router.use(protect);
router.route("/").post(sendMessage).get(getChats);
router.route("/initiate").get(initiateChat);

module.exports = router;
