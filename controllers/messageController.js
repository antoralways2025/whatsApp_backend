const Message = require("../models/Message");

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { sender, receiver, text } = req.body;
    const message = new Message({ sender, receiver, text });
    await message.save();
    res.json(message);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Get messages between two users
exports.getMessages = async (req, res) => {
  try {
    const { userId, contactId } = req.query;

    if (!userId || !contactId) {
      return res.status(400).json({ msg: "Missing userId or contactId" });
    }

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: contactId },
        { sender: contactId, receiver: userId },
      ],
    }).sort({ createdAt: 1 });

     console.log(messages, "server side ")
    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};