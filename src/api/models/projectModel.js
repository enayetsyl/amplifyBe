const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  status: { type: String, enum: ['Draft', 'Active', 'Complete', 'Inactive', 'Closed'], default: 'Draft' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [
    {
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
      role: { type: String, enum: ['Admin', 'Moderator', 'Observer'] }
    }
  ],
  tags: {type: [String], default: []},
  projectPasscode: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware to update the updatedAt field on save
projectSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;





// Earlier schema

// const personSchema = new Schema({
//   userId: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   firstName: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   lastName: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   role: {
//     type: String,
//     required: true,
//     enum: ['Admin', 'Moderator', 'Observer'], 
//   },
//   inviteLink: {
//     type: String,
//     trim: true,
//     default: ""
//   },
//   added_date: {
//     type: Date,
//     default: Date.now
//   },
//   last_updated_on: {
//     type: Date,
//     default: Date.now
//   }
// });

// const projectSchema = new Schema({
//   // General Information
//   projectName: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   projectDescription: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   endDate: {
//     type: Date,
//     required: true
//   },
//   projectPasscode: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   createdBy: {
//     type: Schema.Types.ObjectId,
//     ref: 'User', // Assuming a User model exists
//     required: true
//   },

//   // People
//   people: [personSchema], // Embed person schema

//   // Meeting
//   meetingTitle: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   meetingModerator: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   meetingDescription: {
//     type: String,
//     trim: true
//   },
//   startDate: {
//     type: Date,
//     required: true
//   },
//   startTime: {
//     type: String, // Use a string to represent time; can be formatted as needed
//     required: true,
//     trim: true
//   },
//   timeZone: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   duration: {
//     type: String
//   },
//   ongoing: {
//     type: Boolean,
//     default: false
//   },
//   enableBreakoutRoom: {
//     type: Boolean,
//     default: false
//   },
//   meetingPasscode: {
//     type: String,
//     required: true,
//     trim: true
//   },

//   // Additional Fields
//   status: {
//     type: String,
//     enum: ['Draft', 'Active', 'Complete', 'Inactive', 'Closed'],
//     default: 'Draft'
//   },
//   tags: {
//     type: [String], // Array of tags
//     default: []
//   },

//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now
//   }
// });