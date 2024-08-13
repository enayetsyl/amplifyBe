const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Modified ModeratorInvitation Schema
const ModeratorInvitation = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  joinedOn: {
    type: Date,
    default: Date.now, // Automatically sets the current date and time when a new document is created
  },
});

const Moderator = mongoose.model("Moderator", ModeratorInvitation);

module.exports = Moderator;
