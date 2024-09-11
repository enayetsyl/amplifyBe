const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;


const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['Admin', 'Moderator', 'Observer'],
    default: 'Admin'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  termsAccepted: {
    type: Boolean,
    required: true
  },
  termsAcceptedTime: {
    type: Date,
    default: Date.now
  },
  isCreditCardAdded: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },

});

const User = mongoose.model("User", userSchema);

module.exports = User;

