const mongoose = require('mongoose');

const cycleSchema = new mongoose.Schema({
  type: { type: String, enum: ['Bi-Annual', 'Quarterly'], required: true },
  month: { type: Number, min: 1, max: 12, required: true }, // Trigger month
  year: { type: Number, required: true },
  
  // Phase dates
  triggerDate: { type: Date, required: true }, // When cycle opens
  closeDate: { type: Date, required: true }, // When submissions close
  finalizeDate: { type: Date, required: true }, // When finalization begins
  
  // Status tracking
  status: { 
    type: String, 
    enum: ['Open', 'Closed', 'Finalized', 'Archived'],
    default: 'Open'
  },
  
  // Statistics
  totalEligible: Number,
  totalSubmitted: Number,
  totalFlagged: Number,
  totalWaived: Number,
  totalExtended: Number,
  
  // Admin notes
  notes: String,
  
  // Actions taken during finalization
  finalizedAt: Date,
  finalizedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  finalizeNotes: String,
  
  // Unsubmitted reviews list (snapshot at close)
  unsubmittedReviews: [{
    reviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' },
    employeeName: String,
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewType: String,
    dueDate: Date,
    action: { type: String, enum: ['Pending', 'Extended', 'Waived', 'Escalated'], default: 'Pending' },
    actionReason: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Cycle', cycleSchema);
