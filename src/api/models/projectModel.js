const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  startDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["Open", "Paused", "Closed"],
    default: "Open",
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  moderator: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  timeZone: {
    type: String,
    required: true,
  },
  participants: [
    {
      name: String,
      email: String,
    },
  ],
  observers: [
    {
      name: String,
      email: String,
    },
  ],
  breakoutRooms: [
    {
      name: String,
      participants: [Schema.Types.ObjectId],
      interpreter: Boolean,
      interpreterName: String,
      interpreterEmail: String,
      interpreterLanguage: String,
    },
  ],
  polls: [
    {
      name: String,
      active: Boolean,
      questions: [String],
    },
  ],
  interpreters: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  passcode: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
  },
});


const Project = mongoose.model("Project", ProjectSchema);

module.exports = Project;
