const express = require("express");
const path = require("path");
const multer = require("multer");
const auth = require("../../middleware/auth");
const userController = require("../controllers/userMessageControler");

const user_routes = express.Router(); // Use Router instance

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images"));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});

const upload = multer({ storage: storage });

// Routes
user_routes.get("/register", auth.isLogout, userController.registerload);
user_routes.post("/register", upload.single("image"), userController.register);
user_routes.get("/", auth.isLogout, userController.loadLogin);
user_routes.post("/", userController.login);
user_routes.get("/logout", auth.isLogin, userController.logout);
user_routes.get("/dashboard", auth.isLogin, userController.loadDashboard);
user_routes.get("/users", userController.getUsers);

// routes for saving the chat
user_routes.post("/save-chat", userController.saveChat);

// Catch-all route
user_routes.get("*", function (req, res) {
  res.redirect("/");
});

module.exports = user_routes;
