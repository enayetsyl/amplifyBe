const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Modified AdminActionLog Schema
const NewAdmin = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
    },
    password: {
      type: String,
    },
    confirmPassword: {
      type: String,
    },
  },
  { timestamps: true }
);

const AddAdmin = mongoose.model("AddAdmin", NewAdmin);

module.exports = AddAdmin;
