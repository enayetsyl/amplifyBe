const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// New Poll Schema
const PollSchema = new Schema({
  project: {
    type: Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  pollName: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
  },
  question: {
    type: String,
    required: true,
  },
  options: [
    {
      type: String,
      required: true,
    },
  ],
  choice: {
    type: String,
    default: "Single",
  },
  responses: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      answer: [String],
    },
  ],
});

const Poll = mongoose.model("Poll", PollSchema);

module.exports = Poll;
