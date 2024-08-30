const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "*", // Allow all origins. You can specify your frontend URL instead of "*"
    methods: ["GET", "POST"],
  },
});
const cors = require("cors");

dotenv.config();
app.use(cors());

// Import models
const User = require("./src/api/models/userModelMessage.js");
const Chat = require("./src/api/models/chatModelMesage.js");

// Import routes
const userRoutes = require("./src/api/routes/userMessRoutes.js");
const uploadFileRoutes = require("./src/api/routes/uploadFileRoute.js");
const MeetUserRoutes = require("./src/api/routes/MeetUserRoutes.js");

// Import other route files
require("./src/api/routes/userRoute.js")(app);
require("./src/api/routes/pollRoute.js")(app);
require("./src/api/routes/projectRoute.js")(app);
require("./src/api/routes/meetingLinkRoute.js")(app);
require("./src/api/routes/addAdminRoute.js")(app);
require("./src/api/routes/moderatorInvitationRoute.js")(app);
require("./src/api/routes/breakoutroomRoutes.js")(app);
require("./src/api/routes/videoRoute.js")(app);
require("./src/api/routes/companyRoute.js")(app);

// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://backroom:backroom12072014@backroom.obewdyx.mongodb.net/",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Database Connected"))
  .catch((error) => console.log("Database connection error:", error));

// const server = http.createServer(app);

// Middleware setup
app.use(
  session({
    secret: "thisismysessionseceret",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// Use the user routes
app.use("/", userRoutes);
app.use("/api", uploadFileRoutes);
app.use("/meetuser", MeetUserRoutes);

// Socket.IO namespace
const usp = io.of("/user-namespace"); // Creating our own namespace for communication

usp.on("connection", async function (socket) {
  console.log("User Connected");

  const userId = socket.handshake.auth.token;
  // await User.findByIdAndUpdate({ _id: userId }, { $set: { is_online: "1" } });

  // Broadcast the status of the user if they are online
  socket.broadcast.emit("getOnlineUser", { user_id: userId });

  socket.on("disconnect", async function () {
    console.log("User Disconnected");
    // await User.findByIdAndUpdate({ _id: userId }, { $set: { is_online: "0" } });

    // Broadcast the status of the user if they are offline
    socket.broadcast.emit("getOfflineUser", { user_id: userId });
  });

  // Chat implementation
  socket.on("newChat", function (data) {
    console.log(data);
    socket.broadcast.emit("loadNewChat", data);
    console.log(data, "88");
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
    socket.emit("loadChats", { chats: chats }, () => {
      console.log(chats);
    });
  });
});

io.on("connection", (socket) => {
  console.log("User online");

  socket.on("canvas-data", (data) => {
    socket.broadcast.emit("canvas-data", data);
  });
});

// Start the server
const PORT = process.env.PORT || 8008;
http.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
