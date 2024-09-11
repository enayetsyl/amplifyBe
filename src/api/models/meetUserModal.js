// models/Meeting.js
const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  roomName: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
    unique: true, // Ensures that email must be unique for this room
  },
});

// Ensure that the combination of roomName and email is unique
meetingSchema.index({ roomName: 1, email: 1 }, { unique: true });

const Meeting = mongoose.model('MeetingUserChat', meetingSchema);

module.exports = Meeting;
