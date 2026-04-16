const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Employee', 'Manager', 'Admin'], default: 'Employee' },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dateOfJoining: { type: Date, required: true },
  department: String,
  reviewTrack: { type: String, enum: ['Bi-Annual', 'Quarterly'], default: 'Bi-Annual' },
  probationStatus: { type: String, enum: ['Active', 'Paused', 'Confirmed', 'Extended', 'Closed', 'Under Review'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
