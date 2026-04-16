const Cycle = require('../models/Cycle');
const Review = require('../models/Review');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// Get all active cycles
const getActiveCycles = async (req, res) => {
  try {
    const cycles = await Cycle.find({ 
      status: { $in: ['Open', 'Closed', 'Finalized'] }
    }).sort({ createdAt: -1 });
    
    res.json(cycles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get cycle detail with statistics
const getCycleDetail = async (req, res) => {
  try {
    const cycle = await Cycle.findById(req.params.cycleId);
    if (!cycle) return res.status(404).json({ message: 'Cycle not found' });
    
    // Get all reviews for this cycle
    const reviews = await Review.find({ cycleId: cycle._id })
      .populate('subjectId', 'name email')
      .populate('managerId', 'name email');
    
    // Calculate real-time stats
    const stats = {
      totalEligible: reviews.length,
      submitted: reviews.filter(r => r.status === 'Closed').length,
      pending: reviews.filter(r => r.status === 'Pending' || r.status === 'Submitted').length,
      flagged: reviews.filter(r => r.isFlagged).length,
      waived: reviews.filter(r => r.status === 'Waived').length,
      extended: reviews.filter(r => r.status === 'Extended').length,
      submitPercentage: Math.round((reviews.filter(r => r.status === 'Closed').length / reviews.length) * 100) || 0
    };
    
    const unsubmitted = reviews
      .filter(r => r.status !== 'Closed' && r.status !== 'Waived')
      .map(r => ({
        reviewId: r._id,
        employeeName: r.subjectId.name,
        employeeEmail: r.subjectId.email,
        reviewType: r.type,
        dueDate: r.dueDate,
        extendedUntil: r.extensionGrantedUntil,
        status: r.status
      }));
    
    res.json({
      cycle,
      stats,
      unsubmitted,
      reviews
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Close cycle on the close date (triggered manually or by admin)
const closeCycle = async (req, res) => {
  const { cycleId, notes } = req.body;
  
  try {
    const cycle = await Cycle.findById(cycleId);
    if (!cycle) return res.status(404).json({ message: 'Cycle not found' });
    
    cycle.status = 'Closed';
    cycle.notes = notes || '';
    await cycle.save();
    
    res.json({ message: 'Cycle closed successfully', cycle });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Bulk extend multiple reviews
const bulkExtendReviews = async (req, res) => {
  const { reviewIds, newDeadline, reason } = req.body;
  
  try {
    const updated = [];
    
    for (let reviewId of reviewIds) {
      const review = await Review.findById(reviewId).populate('subjectId');
      
      review.auditLog.push({
        action: 'extended',
        performedBy: req.user._id,
        reason: reason || 'Bulk extension by Admin',
        timestamp: new Date(),
        previousValue: { dueDate: review.dueDate },
        newValue: { extensionGrantedUntil: newDeadline }
      });
      
      review.extensionGrantedUntil = new Date(newDeadline);
      review.status = 'Extended';
      await review.save();
      
      await sendEmail({
        email: review.subjectId.email,
        subject: 'Review Deadline Extended',
        html: `<p>Your review deadline has been extended to ${newDeadline}. Reason: ${reason}</p>`
      });
      
      updated.push(review);
    }
    
    res.json({ message: `${updated.length} reviews extended`, reviews: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Bulk waive multiple reviews
const bulkWaiveReviews = async (req, res) => {
  const { reviewIds, reason } = req.body;
  
  try {
    const waived = [];
    
    for (let reviewId of reviewIds) {
      const review = await Review.findById(reviewId).populate('subjectId');
      
      review.auditLog.push({
        action: 'waived',
        performedBy: req.user._id,
        reason: reason || 'Bulk waiver by Admin',
        timestamp: new Date(),
        previousValue: { status: review.status },
        newValue: { status: 'Waived' }
      });
      
      review.status = 'Waived';
      review.waiverReason = reason;
      await review.save();
      
      await sendEmail({
        email: review.subjectId.email,
        subject: 'Review Waived',
        html: `<p>Your review has been waived. Reason: ${reason}</p>`
      });
      
      waived.push(review);
    }
    
    res.json({ message: `${waived.length} reviews waived`, reviews: waived });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get audit trail for a review
const getReviewAuditTrail = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId)
      .populate('auditLog.performedBy', 'name email');
    
    if (!review) return res.status(404).json({ message: 'Review not found' });
    
    res.json({
      reviewId: review._id,
      auditLog: review.auditLog
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getActiveCycles,
  getCycleDetail,
  closeCycle,
  bulkExtendReviews,
  bulkWaiveReviews,
  getReviewAuditTrail
};
