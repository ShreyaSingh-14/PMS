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
    res.json(reviews);
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

  try {
    const review = await Review.findById(id).populate('subjectId');
    if (!review) return res.status(404).json({ message: 'Review not found' });

    review.managerFeedback = { comments, rating, submittedAt: new Date() };
    review.status = 'Closed'; 

    // Handle soft and hard flags
    if (!comments || comments.trim().length === 0 || rating === 'Below' || detectNegativeSentiment(comments)) {
        review.isFlagged = true;
        review.flaggedAt = new Date();
    }

    const updatedReview = await review.save();
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

module.exports = {
  getPendingReviews,
  getReviewHistory,
  submitSelfFeedback,
  submitManagerFeedback,
  scheduleDiscussion
};
