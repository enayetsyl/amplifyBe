const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contactSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /.+\@.+\..+/,
  },
  company_name: {
    type: String,
  },
  roles: [{
    type: String,
    enum: ['Admin', 'Moderator', 'Observer'],
    required: true,
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  added_date: {
    type: Date,
    default: Date.now,
  },
  last_updated_on: {
    type: Date,
    default: Date.now,
  },
});

contactSchema.pre('save', function (next) {
  this.last_updated_on = Date.now();
  next();
});

const Contact = mongoose.model('Contact', contactSchema);
