const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const app = express();
const http = require("http").createServer(app);
const jwt = require('jsonwebtoken');
const cors = require("cors");

const io = require("socket.io")(http, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});


dotenv.config();
app.use(cors());
app.use(express.json());

// Import models
const User = require("./src/api/models/userModelMessage.js");
const Chat = require("./src/api/models/chatModelMesage.js");

// Import routes
const userRoutes = require("./src/api/routes/userMessRoutes.js");
const uploadFileRoutes = require("./src/api/routes/uploadFileRoute.js");

// Import other route files
require("./src/api/routes/userRoute.js")(app);
require("./src/api/routes/pollRoute.js")(app);
require("./src/api/routes/projectRoute.js")(app);
require("./src/api/routes/meetingRoute.js")(app);
require("./src/api/routes/contactRoute.js")(app);
require("./src/api/routes/meetingLinkRoute.js")(app);
require("./src/api/routes/addAdminRoute.js")(app);
require("./src/api/routes/moderatorInvitationRoute.js")(app);
require("./src/api/routes/breakoutroomRoutes.js")(app);
require("./src/api/routes/videoRoute.js")(app);
require("./src/api/routes/companyRoute.js")(app);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database Connected"))
  .catch((error) => console.log("Database connection error:", error));

// SOCKET FOR CHAT

// Socket.IO namespace
const usp = io.of("/user-namespace"); // Creating our own namespace for communication

// Middleware to verify JWT token
usp.use((socket, next) => {
  console.log('middleware hit')
  const token = socket.handshake.auth.token;
  console.log('Token received:', token); // Log the token received from the client

  if (!token) {
    return next(new Error("Authentication error: Token not provided"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log('Decoded token:', decoded); // Log the decoded token
    socket.userId = decoded.id;  // Extract and attach user ID
    socket.userName = decoded.name;  // Extract and attach user name
    next();
  } catch (err) {
    console.log("JWT verification failed:", err.message);
    next(new Error("Authentication error"));
  }
});



let onlineUsers = {};

usp.on("connection", async function (socket) {
  // console.log("User Connected:", socket);
  console.log("User Connected:", socket.userId);

  // Add the user to the online users list
  onlineUsers[socket.userId] = { userId: socket.userId, userName: socket.userName };

  // Broadcast the updated online users list to all clients in the namespace
  usp.emit("updateUserList", Object.values(onlineUsers));

  socket.on("disconnect", async function () {
    console.log("User Disconnected:", socket.userId);
    // Remove the user from the online users list
    delete onlineUsers[socket.userId];
    
    // Broadcast the updated online users list to all clients in the namespace
    usp.emit("updateUserList", Object.values(onlineUsers));
  });

  // Chat implementation
  socket.on("newChat", function (data) {
    data.sender_id = socket.userId; // Ensure that the sender_id is the connected user
    console.log("New chat message:", data);
    socket.broadcast.emit("loadNewChat", data);
  });

  // Load old chats
  socket.on("existChat", async function (data) {
    const chats = await Chat.find({
      $or: [
        { sender_id: data.sender_id, receiver_id: data.receiver_id },
        { sender_id: data.receiver_id, receiver_id: data.sender_id },
      ],
    });

    // Emit chats to frontend
    socket.emit("loadChats", { chats: chats });
  });
});




// SOCKET FOR PARTICIPANT JOIN

// Create a new namespace for participants
const participantNamespace = io.of("/participant-namespace");

let waitingRoom = {};

// Participant Namespace Connection
participantNamespace.on("connection", (socket) => {
  console.log("Participant Connected:", socket.id);

  // Handle participant joining the meeting
  socket.on("joinMeeting", (participant) => {
    console.log("Participant Joined:", participant);
    // Add the participant to the waiting room with socket.id as the key
    waitingRoom[socket.id] = { ...participant, socketId: socket.id };

    console.log('waiting room line 146', waitingRoom);

    // Notify all moderators about the updated waiting room
    participantNamespace.emit("waitingRoomUpdate", Object.values(waitingRoom));
  });

  // Handle admitting a participant
  socket.on("admitParticipant", (participantSocketId) => {
    console.log("admitParticipant id", participantSocketId);
    const participant = waitingRoom[participantSocketId];
    console.log("admitParticipant line 155", participant);
    if (participant) {
      // Remove participant from the waiting room
      delete waitingRoom[participantSocketId];

      // Notify all clients that the participant has joined the main meeting
      participantNamespace.emit("participantAdmitted", participant);

      // Notify the updated waiting room list to all moderators
      participantNamespace.emit("waitingRoomUpdate", Object.values(waitingRoom));
    }
  });

// Handle meeting start event from moderator
socket.on("startMeeting", () => {
  console.log("Meeting has started");
  participantNamespace.emit("meetingStarted"); // Broadcast to all observers
});

  // Handle participant disconnection
  socket.on("disconnect", () => {
    console.log("Participant Disconnected:", socket.id);
    // Remove participant from waiting room if they disconnect
    delete waitingRoom[socket.id];

    // Notify the updated waiting room list to all moderators
    participantNamespace.emit("waitingRoomUpdate", Object.values(waitingRoom));
  });
});








// Start the server
const PORT = process.env.PORT || 8008;
http.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
