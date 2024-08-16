const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contactSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, match: /.+\@.+\..+/ },
  companyName: { type: String },
  roles: [{ type: String, enum: ['Admin', 'Moderator', 'Observer'], required: true }],
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  addedDate: { type: Date, default: Date.now },
  lastUpdatedOn: { type: Date, default: Date.now }
});

contactSchema.pre('save', function (next) {
  this.lastUpdatedOn = Date.now();
  next();
});

const Contact = mongoose.model('Contact', contactSchema);
module.exports = Contact;





// earlier schema

// const contactSchema = new mongoose.Schema({
//   firstName: {
//     type: String,
//     required: true,
//   },
//   lastName: {
//     type: String,
//     required: true,
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     match: /.+\@.+\..+/,
//   },
//   companyName: {
//     type: String,
//   },
//   roles: [{
//     type: String,
//     enum: ['Admin', 'Moderator', 'Observer'],
//     required: true,
//   }],
//   createdBy: {
//     type: Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   added_date: {
//     type: Date,
//     default: Date.now,
//   },
//   last_updated_on: {
//     type: Date,
//     default: Date.now,
//   },
// });