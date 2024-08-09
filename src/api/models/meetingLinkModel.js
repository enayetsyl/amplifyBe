const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Modified AdminActionLog Schema
const MeetingLink = new Schema({
  name: {
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

const SendLink = mongoose.model("MeetingLink", MeetingLink);

module.exports = SendLink;
