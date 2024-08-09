const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// New BreakoutRoom Schema
const MeetingVideo = new Schema(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    meeting: {
      type: Schema.Types.ObjectId,
      ref: "SendLink",
      required: true,
    },
    video: [String],
    transcript: [String],
  },
  { timestamps: true }
);

const MeetingRecording = mongoose.model("Meeting Recording", MeetingVideo);

module.exports = MeetingRecording;
