const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Modified AdminActionLog Schema
const AdminActionLogSchema = new Schema({
  admin: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  targetUser: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  details: {
    type: String,
  },
  performedAt: {
    type: Date,
    default: Date.now,
  },
});

const AdminActionLog = mongoose.model("AdminActionLog", AdminActionLogSchema);

module.exports = AdminActionLog;
