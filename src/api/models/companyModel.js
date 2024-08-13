const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AddCompany = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Company = mongoose.model("Company", AddCompany);

module.exports = Company;
