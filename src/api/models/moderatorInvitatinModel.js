const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Modified AdminActionLog Schema
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
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: "Project",
  },
});

const Moderator = mongoose.model("Moderator", ModeratorInvitation);

module.exports = Moderator;
