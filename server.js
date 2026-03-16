require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const messageRoutes = require("./routes/messages");

const app = express();
const server = http.createServer(app);

connectDB();

/* EXPRESS CORS */

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://neavatalk.netlify.app"
    ],
    credentials: true
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

/* SOCKET.IO */

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://neavatalk.netlify.app"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

let onlineUsers = {};

io.on("connection", (socket) => {

  console.log("User connected:", socket.id);

  // USER JOIN
  socket.on("joinRoom", (userId) => {

    onlineUsers[userId] = socket.id;

    io.emit("updateUserStatus", Object.keys(onlineUsers));

  });

  /* =========================
     REALTIME MESSAGE SYSTEM
     ========================= */

  socket.on("sendMessage", (message) => {

    const receiverSocket = onlineUsers[message.receiver];

    if (receiverSocket) {
      io.to(receiverSocket).emit("receiveMessage", message);
    }

  });

  /* =========================
     TYPING INDICATOR
     ========================= */

  socket.on("typing", ({ sender, receiver }) => {

    const receiverSocket = onlineUsers[receiver];

    if (receiverSocket) {
      io.to(receiverSocket).emit("typing", sender);
    }

  });

  socket.on("stopTyping", ({ sender, receiver }) => {

    const receiverSocket = onlineUsers[receiver];

    if (receiverSocket) {
      io.to(receiverSocket).emit("stopTyping", sender);
    }

  });

  /* =========================
     CALL EVENTS
     ========================= */

  socket.on("callUser", ({ from, to, type }) => {

    const receiverSocket = onlineUsers[to];

    if (receiverSocket) {
      io.to(receiverSocket).emit("incomingCall", {
        from,
        type
      });
    }

  });

  socket.on("acceptCall", ({ from, to }) => {

    const callerSocket = onlineUsers[to];

    if (callerSocket) {
      io.to(callerSocket).emit("callAccepted", { from });
    }

  });

  socket.on("rejectCall", ({ to }) => {

    const callerSocket = onlineUsers[to];

    if (callerSocket) {
      io.to(callerSocket).emit("callRejected");
    }

  });

  /* =========================
     DISCONNECT
     ========================= */

  socket.on("disconnect", () => {

    console.log("User disconnected:", socket.id);

    onlineUsers = Object.fromEntries(
      Object.entries(onlineUsers).filter(
        ([k, v]) => v !== socket.id
      )
    );

    io.emit("updateUserStatus", Object.keys(onlineUsers));

  });

});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});