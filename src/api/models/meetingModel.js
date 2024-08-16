const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const meetingSchema = new Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true },
  description: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  moderator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['Draft', 'Scheduled', 'In Progress', 'Completed', 'Cancelled', 'Closed'], 
    default: 'Draft' 
  },
  passcode: { type: String, required: true },
  breakoutRoom: { type: Boolean, default: false }
});

const Meeting = mongoose.model('Meeting', meetingSchema);

module.exports = Meeting;