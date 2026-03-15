const mongoose = require("mongoose");

const CallSchema = new mongoose.Schema({
  caller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: { type: String, enum: ["audio", "video"] },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model("Call", CallSchema);