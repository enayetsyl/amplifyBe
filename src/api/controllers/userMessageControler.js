const User = require("../models/userModelMessage");
const Chat = require("../models/chatModelMesage");
const bcrypt = require("bcrypt");

const registerload = async (req, res) => {
  try {
    res.render("register");
  } catch (error) {
    console.log(error);
  }
};

const register = async (req, res) => {
  try {
    if (!req.file) {
      res.render("register", { message: "Please upload an image" });
      return;
    }

    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      image: "images/" + req.file.filename,
      password: passwordHash,
    });

    await user.save();
    res.render("login", { message: "Your Registration has been Completed!" });
  } catch (error) {
    console.log(error);
  }
};

const loadLogin = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error.message);
  }
};

const login = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({ email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        req.session.user = userData;
        res.redirect("/dashboard");
      } else {
        res.render("login", { message: "Email or Password is Incorrect" });
      }
    } else {
      res.render("login", { message: "Email or Password is Incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const logout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

const loadDashboard = async (req, res) => {
  try {
    var users = await User.find({ _id: { $nin: [req.session.user._id] } }); //ye hume vo users sare user dega bs us ko chod kar jisne login kiya hua hai
    res.render("dashboard", { user: req.session.user, users: users });
  } catch (error) {
    console.log(error.message);
  }
};

const saveChat = async (req, res) => {
  try {
    var chat = new Chat({
      sender_id: req.body.sender_id,
      receiver_id: req.body.receiver_id,
      message: req.body.message,
    });
    var newChat = await chat.save();
    res
      .status(200)
      .send({ success: true, msg: "chat inserted!", data: newChat });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};
const getUsers = async (req, res) => {
  console.log("Fetching users");
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res
      .status(400)
      .json({
        success: false,
        message: "Failed to fetch users",
        error: error.message,
      });
  }
};

module.exports = {
  register,
  registerload,
  loadLogin,
  login,
  logout,
  getUsers,
  loadDashboard,
  saveChat,
};
