const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  designatedReviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Acting reviewer if manager unavailable
  cycleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cycle' }, // Reference to parent cycle
  type: { type: String, enum: ['Probation_30', 'Probation_60', 'Probation_80', 'Cycle_BiAnnual', 'Cycle_Quarterly'] },
  status: { type: String, enum: ['Pending', 'Submitted', 'Flagged', 'Closed', 'Waived', 'Extended'], default: 'Pending' },
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
  isFlagged: { type: Boolean, default: false },
  flaggedAt: Date,
  hrNote: String,
  hrResolved: { type: Boolean, default: false },
  discussionDate: Date,
  flagActionTaken: { type: Boolean, default: false },
  sharedGoalsContext: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Goal' }],
  contextNote: String,
  dueDate: { type: Date },
  extensionGrantedUntil: { type: Date }, // If extended by admin
  waiverReason: String, // If waived by admin
  auditLog: [{ // Track all admin actions
    action: String, // 'reassigned', 'extended', 'waived', 'escalated'
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: String,
    timestamp: { type: Date, default: Date.now },
    previousValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed
  }]
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
