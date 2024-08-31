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
const { Timestamp } = require('mongodb');


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


  const ChatMessageSchema = new mongoose.Schema({
    meetingId: {
      type: String,
      required: true
    },
    senderName: {
      type: String,
      required: true
    },
    receiverName: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: { type: Date, default: Date.now }
  });

  const ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema);


// SOCKET FOR PARTICIPANT JOIN

// Create a new namespace for participants
const participantNamespace = io.of("/participant-namespace");

let waitingRoom = [];
let isMeetingStarted = false;
let meetingId;
let activeParticipants = [];
let observerList = []

participantNamespace.on("connection", (socket) => {
  console.log("Participant Connected:", socket.id);

  socket.on("joinMeeting", (user) => {
    console.log('user for joining meeting', user)
    socket.join(user.meetingId);
    if (user.role === "Participant") {
      const participantData = { ...user, socketId: socket.id };
      waitingRoom.push(participantData);

      
      if (isMeetingStarted) {
        participantNamespace.emit("newParticipantWaiting", participantData);
        console.log('New participant waiting:', participantData);
      }
    } else if (user.role === "Observer"){
      participantNamespace.emit("observerJoined", (user));
    } else {
      // For non-participants (Moderator, Observer, Admin)
      activeParticipants.push({ ...user, socketId: socket.id });
      participantNamespace.emit("userJoined", { ...user, socketId: socket.id });
      
      console.log('activeParticipant',activeParticipants)

      participantNamespace.emit("activeParticipantsUpdated", activeParticipants);
    
    }
  });

 
  // socket.on("startMeeting", ({ meetingId }) => {
  //   isMeetingStarted = true;
  //   console.log(`Meeting started for ID: ${meetingId}. Current waiting room:`, waitingRoom);
  //   meetingId = meetingId;
  //   participantNamespace.emit("meetingStarted", waitingRoom);
  // });

  socket.on("startMeeting", ({ meetingId }) => {
    isMeetingStarted = true;
    socket.join(meetingId);
    console.log(`Meeting started for ID: ${meetingId}. Current waiting room:`, waitingRoom);
    participantNamespace.to(meetingId).emit("meetingStarted", waitingRoom);
  });
  

  
  socket.on("sendMessage", async (data) => {
    const { meetingId, senderName,
      receiverName, message } = data.message;
    console.log('send message data', data.message)
    const newMessage = new ChatMessage({
      meetingId,
      senderName,
      receiverName,
      message
    });

    try {
      await newMessage.save();
      participantNamespace.to(meetingId).emit("newMessage", newMessage);
      console.log('sending new message to the frontend', newMessage)
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("getChatHistory", async (meetingId) => {
    try {
      const chatHistory = await ChatMessage.find({ meetingId }).sort('timestamp');
      console.log(' chat history to send at front end', chatHistory)
      socket.emit("chatHistory", chatHistory);
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  });

  socket.on("admitParticipant", (socketId) => {
    console.log('Attempting to admit participant with socketId:', socketId);
    console.log('Waiting room before participant admit:', waitingRoom);
   
    const participant = waitingRoom.find(p => p.socketId === socketId);
    if (participant) {
      waitingRoom = waitingRoom.filter(p => p.socketId !== socketId);

      activeParticipants.push(participant);
      
      console.log('Participant admitted:', participant);

       
      participantNamespace.emit("participantAdmitted", participant, isMeetingStarted);

      participantNamespace.emit("activeParticipantsUpdated", activeParticipants);

      console.log('activeParticipant',activeParticipants)
   
    }else {
      console.log('Participant not found in waiting room');
    }
  });
  socket.on("leaveMeeting", (user) => {
    console.log('User leaving meeting:', user);

    activeParticipants = activeParticipants.filter(p => p.socketId !== socket.id);
    
    participantNamespace.emit("participantLeft", socket.id);
    
    console.log('Active participants after leave:', activeParticipants);

    participantNamespace.emit("activeParticipantsUpdated", activeParticipants);
 

  });

  socket.on("disconnect", () => {
    console.log('User disconnected:', socket.id);

    activeParticipants = activeParticipants.filter(p => p.socketId !== socket.id);

    participantNamespace.emit("participantLeft", socket.id);

    console.log('Active participants after disconnect:', activeParticipants);

    participantNamespace.emit("activeParticipantsUpdated", activeParticipants);


  });

});;








// Start the server
const PORT = process.env.PORT || 8008;
http.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
