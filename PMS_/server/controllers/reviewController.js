const Review = require('../models/Review');
const Goal = require('../models/Goal');

const getPendingReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      $or: [{ subjectId: req.user._id }, { managerId: req.user._id }],
      status: { $ne: 'Closed' }
    }).populate('subjectId', 'name email').populate('managerId', 'name email');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReviewHistory = async (req, res) => {
  try {
    const reviews = await Review.find({
      $or: [{ subjectId: req.user._id }, { managerId: req.user._id }],
      status: 'Closed'
    }).populate('subjectId', 'name email').populate('managerId', 'name email');

    // Cross-share enforcement: employee only sees managerFeedback after they've
    // submitted their own self-feedback. This covers edge cases like admin waivers.
    const sanitized = reviews.map(rev => {
      const obj = rev.toObject();
      const isSubject = rev.subjectId?._id?.toString() === req.user._id.toString();
      if (isSubject && !rev.selfFeedback?.submittedAt) {
        delete obj.managerFeedback;
        obj.crossShareBlocked = true; // Signal to UI to show "Pending your submission"
      }
      return obj;
    });

    res.json(sanitized);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const detectNegativeSentiment = (text) => {
  if (!text) return false;
  const negativeWords = ['terrible', 'unfair', 'unacceptable', 'toxic', 'quit', 'overworked', 'burnout', 'abusive'];
  return negativeWords.some(word => text.toLowerCase().includes(word));
};

const submitSelfFeedback = async (req, res) => {
  const { id } = req.params;
  const { progress, rating } = req.body;

  try {
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    
    // P0 Block
    const activeGoalCount = await Goal.countDocuments({ ownerId: req.user._id, status: 'Active' });
    if (activeGoalCount === 0) return res.status(400).json({ message: 'Self-rating blocked. No active goals.' });

    review.selfFeedback = { progress, rating, submittedAt: new Date() };
    review.status = 'Submitted';

    // P2 Soft Flag: Blank open-ended response
    if (!progress || progress.trim().length === 0) {
        review.isFlagged = true;
        review.contextNote = 'Soft-Flag: Blank open-ended response.';
        review.flaggedAt = new Date();
    }

    // P2 Hard Flag: Rating threshold or sentiment
    if (rating === 'Below' || detectNegativeSentiment(progress)) {
        review.isFlagged = true;
        review.flaggedAt = new Date();
    }

    const updatedReview = await review.save();
    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const submitManagerFeedback = async (req, res) => {
  const { id } = req.params;
  const { comments, rating } = req.body;
  const sendEmail = require('../utils/sendEmail');

  try {
    const review = await Review.findById(id).populate('subjectId').populate('managerId');
    if (!review) return res.status(404).json({ message: 'Review not found' });

    review.managerFeedback = { comments, rating, submittedAt: new Date() };
    review.status = 'Closed'; 

    // Handle soft and hard flags
    if (!comments || comments.trim().length === 0 || rating === 'Below' || detectNegativeSentiment(comments)) {
        review.isFlagged = true;
        review.flaggedAt = new Date();
    }

    const updatedReview = await review.save();
    
    // P0: Cross-share email notification to employee
    await sendEmail({
      email: review.subjectId.email,
      subject: `Your ${review.type} Feedback is Ready`,
      html: `<p>Hi ${review.subjectId.name},</p><p>Your manager has completed their feedback for your ${review.type} review. Log in to view the feedback in your review history.</p><p>Rating: <strong>${rating}</strong></p>`
    });
    
    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const scheduleDiscussion = async (req, res) => {
  const { date } = req.body;
  const sendEmail = require('../utils/sendEmail');
  try {
    const review = await Review.findById(req.params.id).populate('subjectId');
    review.discussionDate = new Date(date);
    await review.save();
    await sendEmail({
      email: review.subjectId.email,
      subject: 'Discussion Scheduled',
      html: `<p>Meeting set for ${date}</p>`
    });
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// P1: Admin reassigns manager if unavailable
const reassignReviewer = async (req, res) => {
  const { reviewId, newReviewerId, reason } = req.body;
  const sendEmail = require('../utils/sendEmail');
  
  try {
    const review = await Review.findById(reviewId).populate('subjectId').populate('managerId');
    if (!review) return res.status(404).json({ message: 'Review not found' });
    
    const newReviewer = await require('../models/User').findById(newReviewerId);
    if (!newReviewer) return res.status(404).json({ message: 'Reviewer not found' });
    
    // Audit log entry
    review.auditLog.push({
      action: 'reassigned',
      performedBy: req.user._id,
      reason: reason || 'Manager unavailable',
      timestamp: new Date(),
      previousValue: { managerId: review.managerId },
      newValue: { designatedReviewerId: newReviewerId }
    });
    
    review.designatedReviewerId = newReviewerId;
    await review.save();
    
    // Notify all parties
    await sendEmail({
      email: review.subjectId.email,
      subject: 'Review Assignment Changed',
      html: `<p>Your review has been reassigned to ${newReviewer.name} due to: ${reason}</p>`
    });
    
    await sendEmail({
      email: newReviewer.email,
      subject: 'New Review Assignment',
      html: `<p>You have been assigned to review ${review.subjectId.name}. Reason: ${reason}</p>`
    });
    
    res.json({ message: 'Reviewer reassigned successfully', review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// P1: Admin extends cycle deadline
const extendReview = async (req, res) => {
  const { reviewId, newDeadline, reason } = req.body;
  
  try {
    const review = await Review.findById(reviewId).populate('subjectId');
    if (!review) return res.status(404).json({ message: 'Review not found' });
    
    review.auditLog.push({
      action: 'extended',
      performedBy: req.user._id,
      reason: reason || 'Admin extension',
      timestamp: new Date(),
      previousValue: { dueDate: review.dueDate },
      newValue: { extensionGrantedUntil: newDeadline }
    });
    
    review.extensionGrantedUntil = new Date(newDeadline);
    review.status = 'Extended';
    await review.save();
    
    const sendEmail = require('../utils/sendEmail');
    await sendEmail({
      email: review.subjectId.email,
      subject: 'Review Deadline Extended',
      html: `<p>Your review deadline has been extended to ${newDeadline}. Reason: ${reason}</p>`
    });
    
    res.json({ message: 'Review extended successfully', review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// P1: Admin waives review
const waiveReview = async (req, res) => {
  const { reviewId, reason } = req.body;
  
  try {
    const review = await Review.findById(reviewId).populate('subjectId');
    if (!review) return res.status(404).json({ message: 'Review not found' });
    
    review.auditLog.push({
      action: 'waived',
      performedBy: req.user._id,
      reason: reason || 'Admin waiver',
      timestamp: new Date(),
      previousValue: { status: review.status },
      newValue: { status: 'Waived' }
    });
    
    review.status = 'Waived';
    review.waiverReason = reason;
    await review.save();
    
    const sendEmail = require('../utils/sendEmail');
    await sendEmail({
      email: review.subjectId.email,
      subject: 'Review Waived',
      html: `<p>Your review has been waived. Reason: ${reason}</p>`
    });
    
    res.json({ message: 'Review waived successfully', review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPendingReviews,
  getReviewHistory,
  submitSelfFeedback,
  submitManagerFeedback,
  scheduleDiscussion,
  reassignReviewer,
  extendReview,
  waiveReview
};
