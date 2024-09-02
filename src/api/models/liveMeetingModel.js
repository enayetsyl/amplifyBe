const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const liveMeetingSchema = new Schema({
  meetingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting', required: true },
  waitingRoom: [{
    name: { type: String, required: true },
    role: { type: String, required: true }
  }],
  moderator: {
    name: { type: String, required: true },
    id: { type: String, required: true },
    role: { type: String, required: true }
  },
  participantsList: [{
    name: { type: String, required: true },
    id: { type: String, required: true },
    role: { type: String, required: true }
  }],
  observerList: [{
    name: { type: String, required: true },
    id: { type: String, required: true },
    role: { type: String, required: true }
  }],
  ongoing: {
    type: Boolean,
    default: false
  },
  webRtcRoomId: {
    type: String,
    default: null
  },
  participantChat: [{type: mongoose.Schema.Types.ObjectId, ref: 'ChatMessage'}],
  observerChat: [{type: mongoose.Schema.Types.ObjectId, ref: 'ChatMessage'}],
});

const LiveMeeting = mongoose.model('LiveMeeting', liveMeetingSchema);

module.exports = LiveMeeting;