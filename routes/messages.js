const express = require("express");
const router = express.Router();
const multer = require("multer");

// storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage: storage });

// voice upload route
router.post("/voice", upload.single("audio"), async (req, res) => {
  try {
    const file = req.file;

    res.json({
      success: true,
      audio: file.filename
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Upload failed" });
  }
});

module.exports = router;