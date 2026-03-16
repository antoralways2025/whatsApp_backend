const router = require("express").Router();
const Message = require("../models/Message");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");

const upload = multer({ dest: "uploads/" });

/* GET MESSAGES */

router.get("/", async (req, res) => {

  const { userId, contactId } = req.query;

  try {

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: contactId },
        { sender: contactId, receiver: userId }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);

  } catch (err) {

    res.status(500).json(err);

  }

});

/* SEND TEXT MESSAGE */

router.post("/", async (req, res) => {

  try {

    const message = new Message(req.body);

    const saved = await message.save();

    res.json(saved);

  } catch (err) {

    res.status(500).json(err);

  }

});

/* FILE MESSAGE */

router.post("/file", upload.single("file"), async (req, res) => {

  try {

    const result = await cloudinary.uploader.upload(req.file.path);

    const message = new Message({
      sender: req.body.sender,
      receiver: req.body.receiver,
      file: result.secure_url,
      fileType: req.file.mimetype
    });

    const saved = await message.save();

    res.json(saved);

  } catch (err) {

    res.status(500).json(err);

  }

});

module.exports = router;