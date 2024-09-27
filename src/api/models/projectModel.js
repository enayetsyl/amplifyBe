const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  status: { type: String, enum: ['Draft', 'Active', 'Complete', 'Inactive', 'Closed'], default: 'Draft' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [
    {
      userId: { type: Schema.Types.ObjectId, ref: 'Contact' },
      roles: { type: [String], enum: ['Admin', 'Moderator', 'Observer'] },
      email: {type: String}
    }
  ],
  tags: {type: [String], default: []},
  projectPasscode: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware to update the updatedAt field on save
projectSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;




