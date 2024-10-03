const mongoose = require('mongoose');
const { Schema } = mongoose;

const RepositorySchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  addedBy: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  meetingId: {
    type: Schema.Types.ObjectId,
    ref: 'Meeting',
    required: true,
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  cloudinaryLink: {
    type: String,
    default: '',
  },
  addedDate: {
    type: Date,
    default: Date.now,
  },
});

const Repository = mongoose.model('Repository', RepositorySchema);


module.exports = Repository
