const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Modified User Schema
const UserSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: function () {
      return this.status !== "Pending";
    },
  },
  role: {
    type: String,
    enum: [
      "PrimaryAdmin",
      "InternalAdmin",
      "ExternalAdmin",
      "Moderator",
      "Participant",
      "Observer",
    ],
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Active", "Inactive"],
    default: "Pending",
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: "Company",
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  profilePicture: {
    type: String,
    default: "",
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  joinedOn: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  lastLoginAt: {
    type: Date,
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
