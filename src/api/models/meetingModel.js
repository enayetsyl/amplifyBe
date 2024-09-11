const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const meetingSchema = new Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true },
  description: { type: String },
  startDate: { type: Date, required: true },

  moderator: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', default: null },
  startTime: {
    type: String,
    required: true,
    trim: true
  },
  timeZone: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: String
  },
  ongoing: {
    type: Boolean,
    default: false
  },
  
  enableBreakoutRoom: {
    type: Boolean,
    default: false
  },

  meetingPasscode: { type: String, required: true },

});

const Meeting = mongoose.model('Meeting', meetingSchema);

module.exports = Meeting;

