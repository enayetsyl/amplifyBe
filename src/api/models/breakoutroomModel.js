const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// New BreakoutRoom Schema
const BreakoutRoomSchema = new Schema(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    duration: {
      type: Number,
      required: true, // Duration in minutes, you can adjust as per your requirements
    },
    interpretor: {
      name: {
        type: String,
      },
      email: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

const BreakoutRoom = mongoose.model("BreakoutRoom", BreakoutRoomSchema);

module.exports = BreakoutRoom;
