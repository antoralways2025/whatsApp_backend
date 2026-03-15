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

/* CORS FOR EXPRESS */
app.use(
  cors({
    origin: [
      "http://localhost:3000",          // local React
      "https://neavatalk.netlify.app"   // deployed frontend
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

let onlineUsers = {}; // { userId: socket.id }

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  /* JOIN ROOM */
  socket.on("joinRoom", (userId) => {
    onlineUsers[userId] = socket.id;
    // broadcast updated online users
    io.emit("updateUserStatus", Object.keys(onlineUsers));
  });

  /* CHAT MESSAGES */
  socket.on("sendMessage", (msg) => {
    const receiverSocket = onlineUsers[msg.receiver];
    if (receiverSocket) {
      io.to(receiverSocket).emit("receiveMessage", msg);
    }
  });

  /* TYPING INDICATOR */
  socket.on("typing", ({ receiver }) => {
    const receiverSocket = onlineUsers[receiver];
    if (receiverSocket) io.to(receiverSocket).emit("typing");
  });

  socket.on("stopTyping", ({ receiver }) => {
    const receiverSocket = onlineUsers[receiver];
    if (receiverSocket) io.to(receiverSocket).emit("stopTyping");
  });

  /* CALL REQUEST */
  socket.on("callUser", ({ from, to, type }) => {
    const receiverSocket = onlineUsers[to];
    if (receiverSocket) io.to(receiverSocket).emit("incomingCall", { from, type });
  });

  /* CALL ACCEPTED */
  socket.on("acceptCall", ({ from, to }) => {
    const callerSocket = onlineUsers[to];
    if (callerSocket) io.to(callerSocket).emit("callAccepted", { from });
  });

  /* CALL REJECTED */
  socket.on("rejectCall", ({ to }) => {
    const callerSocket = onlineUsers[to];
    if (callerSocket) io.to(callerSocket).emit("callRejected");
  });

  /* DISCONNECT */
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    // remove user from online list
    onlineUsers = Object.fromEntries(
      Object.entries(onlineUsers).filter(([k, v]) => v !== socket.id)
    );
    // broadcast updated online users
    io.emit("updateUserStatus", Object.keys(onlineUsers));
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log("Server running on port", PORT));