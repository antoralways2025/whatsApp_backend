const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { sendMessage, getMessages } = require("../controllers/messageController");

// GET messages between two users
router.get("/", auth, getMessages);

// POST message
router.post("/", auth, sendMessage);

module.exports = router;