const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

dotenv.config();
const app = express();
app.use(cors());

// Import models
const User = require("./src/api/models/userModelMessage.js");
const Chat = require("./src/api/models/chatModelMesage.js");

// Import routes
const userRoutes = require("./src/api/routes/userMessRoutes.js");
const uploadFileRoutes = require("./src/api/routes/uploadFileRoute");

// Import other route files

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("database Connected"));
require("./src/api/routes/userRoute.js")(app);
require("./src/api/routes/pollRoute.js")(app);
require("./src/api/routes/projectRoute.js")(app);
require("./src/api/routes/meetingLinkRoute.js")(app);
require("./src/api/routes/addAdminRoute.js")(app);
require("./src/api/routes/moderatorInvitationRoute.js")(app);
require("./src/api/routes/breakoutroomRoutes.js")(app);
require("./src/api/routes/videoRoute.js")(app);
require("./src/api/routes/companyRoute.js")(app);

const server = http.createServer(app);
const io = socketIo(server);

// Middleware setup
app.use(cors());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname, "public")));

// Set up EJS for rendering views
// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));

// Use the user routes
app.use("/", userRoutes);
app.use("/api", uploadFileRoutes); // Use the upload file routes

// Socket.IO namespace
var usp = io.of("/user-namespace"); // Creating our own namespace or communication channel used to communicate

usp.on("connection", async function (socket) {
  console.log("User Connected");

  var userId = socket.handshake.auth.token;
  await User.findByIdAndUpdate({ _id: userId }, { $set: { is_online: "1" } });

  // Broadcasting the status of user if they are online, so it dynamically changes the section of online users
  socket.broadcast.emit("getOnlineUser", { user_id: userId });

  socket.on("disconnect", async function () {
    console.log("User Disconnected");
    var userId = socket.handshake.auth.token;
    await User.findByIdAndUpdate({ _id: userId }, { $set: { is_online: "0" } });
    // Broadcasting the status of user if they are offline
    socket.broadcast.emit("getOfflineUser", { user_id: userId });
  });

  // Chat implementation
  socket.on("newChat", function (data) {
    socket.broadcast.emit("loadNewChat", data);
  });

  // Load old chats
  socket.on("existChat", async function (data) {
    // OR condition because we want both chats, sender and receiver
    var chats = await Chat.find({
      $or: [
        { sender_id: data.sender_id, receiver_id: data.receiver_id },
        { sender_id: data.receiver_id, receiver_id: data.sender_id },
      ],
    });
    // When we get chats, we have to fire an event through which frontend will get the chats
    socket.emit("loadChats", { chats: chats });
  });
});

// Start the server
const PORT = process.env.PORT || 8008;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
