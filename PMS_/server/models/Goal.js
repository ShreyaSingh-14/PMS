const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['Company', 'Team', 'Individual'] },
  status: { type: String, enum: ['Draft', 'Pending Approval', 'Active', 'Completed', 'Archived'], default: 'Draft' },
  completionPercentage: { type: Number, default: 0 },
  weightage: { type: Number, default: 0 }, // Expected to total 100% per user
  cycle: { type: String }, // e.g., 'Q1 2024'
  deadline: { type: Date },
  subtasks: [{
    title: String,
    isCompleted: { type: Boolean, default: false }
  }],
  notes: [{
    content: String,
    date: { type: Date, default: Date.now }
  }],
  blockers: [{
    issue: String,
    isResolved: { type: Boolean, default: false }
  }],
  parentGoalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal' }, // For Cascading (Company -> Team -> Individual)
}, { timestamps: true });

// ── Indexes for admin aggregation query performance ───────────────────────────
// Used by getOrgAggregation + getCompanyAggregations: $match + $group on type
goalSchema.index({ type: 1 });
// Used by getOrgGoals populate
goalSchema.index({ ownerId: 1 });

module.exports = mongoose.model('Goal', goalSchema);
