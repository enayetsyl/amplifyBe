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
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  observers: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  breakoutRooms: [
    {
      type: Schema.Types.ObjectId,
      ref: "BreakoutRoom",
    },
  ],
  polls: [
    {
      type: Schema.Types.ObjectId,
      ref: "Poll",
    },
  ],
  interpreters: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  psscode: {
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
