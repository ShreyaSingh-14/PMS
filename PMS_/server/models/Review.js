const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['Probation_30', 'Probation_60', 'Probation_80', 'Cycle_BiAnnual', 'Cycle_Quarterly'] },
  status: { type: String, enum: ['Pending', 'Submitted', 'Flagged', 'Closed'], default: 'Pending' },
  selfFeedback: {
    progress: String,
    rating: { type: String, enum: ['Below', 'Meets', 'Above'] },
    submittedAt: Date
  },
  managerFeedback: {
    comments: String,
    rating: { type: String, enum: ['Below', 'Meets', 'Above'] },
    submittedAt: Date
  },
  isFlagged: { type: Boolean, default: false }, // Tagged if sentiment is negative, score low, or blank
  flaggedAt: Date,
  hrNote: String, // Pre-call briefing / Analysis
  hrResolved: { type: Boolean, default: false },
  discussionDate: Date,
  flagActionTaken: { type: Boolean, default: false },
  sharedGoalsContext: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Goal' }],
  contextNote: String,
  dueDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
