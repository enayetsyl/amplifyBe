const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const creditCardSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true, 
  },
  email: {
    type: String,
    required: true,
    match: [/.+\@.+\..+/, 'Please enter a valid email address'],
  },
  cardholderName: {
    type: String,
    required: true,
    trim: true,
  },
  cardNumber: {
    type: String,
    required: true,
    match: [/^\d{4}-\d{4}-\d{4}-\d{4}$/, 'Please enter a valid card number'],
  },
  expiryMonth: {
    type: String,
    required: true,
    match: [/^\d{2}$/, 'Please enter a valid month in MM format'],
  },
  expiryYear: {
    type: String,
    required: true,
    match: [/^\d{4}$/, 'Please enter a valid year in YYYY format'],
  },
  CVC: {
    type: String,
    required: true,
    match: [/^\d{3}$/, 'Please enter a valid 3-digit CVC'],
  },
}, {
  timestamps: true,
});

const CreditCard = mongoose.model('CreditCard', creditCardSchema);

module.exports = CreditCard;
