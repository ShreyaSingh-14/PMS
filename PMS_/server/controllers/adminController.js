const Goal = require('../models/Goal');
const Review = require('../models/Review');
const User = require('../models/User');

// @desc    Get Admin Dashboard Stats & Pattern Detection (P0, P2)
// @route   GET /api/admin/dashboard-stats
const getDashboardStats = async (req, res) => {
  try {
    const totalReviews = await Review.countDocuments();
    const closedReviews = await Review.countDocuments({ status: 'Closed' });
    const complianceRate = totalReviews > 0 ? (closedReviews / totalReviews) * 100 : 100;

    const flaggedReviews = await Review.find({ isFlagged: true, status: { $ne: 'Closed' } })
      .populate('subjectId', 'name department')
      .populate('managerId', 'name');

    // P2: Pattern Detection (Repeat flag alerts across consecutive cycles)
    const patternAlerts = [];
    for (let review of flaggedReviews) {
      if (!review.subjectId) continue;
      // Find if this subject had a previously FLAGGED review
      const pastFlag = await Review.findOne({ 
        subjectId: review.subjectId._id, 
        isFlagged: true, 
        _id: { $ne: review._id },
        status: 'Closed'
      });
      if (pastFlag) {
        patternAlerts.push({
          subject: review.subjectId.name,
          currentReview: review.type,
          pastReview: pastFlag.type,
          message: 'Consecutive Performance Flags Detected'
        });
      }
    }

    const activeProbations = await User.countDocuments({ probationStatus: 'Active' });

    res.json({
      complianceRate: complianceRate.toFixed(1),
      flaggedQueue: flaggedReviews.length,
      patternAlerts, 
      flaggedDetails: flaggedReviews,
      pendingProbations: activeProbations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    GMS Org-level aggregation (P1)
// @route   GET /api/admin/org-aggregation
const getOrgAggregation = async (req, res) => {
  try {
    const companyGoals = await Goal.find({ type: 'Company' });
    const teamGoals = await Goal.find({ type: 'Team' });
    const individualGoals = await Goal.find({ type: 'Individual' });

    const calcAvg = (goals) => goals.length ? (goals.reduce((acc, g) => acc + g.completionPercentage, 0) / goals.length).toFixed(1) : 0;

    res.json({
      Company: { count: companyGoals.length, avgCompletion: calcAvg(companyGoals) },
      Team: { count: teamGoals.length, avgCompletion: calcAvg(teamGoals) },
      Individual: { count: individualGoals.length, avgCompletion: calcAvg(individualGoals) },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Month-over-month comparison (P2)
// @route   GET /api/admin/mom-comparison
const getMonthOverMonth = async (req, res) => {
  try {
    // Basic aggregation for closed reviews grouped by month
    const currentYear = new Date().getFullYear();
    const momData = await Review.aggregate([
      { $match: { status: 'Closed', createdAt: { $gte: new Date(`${currentYear}-01-01`) } } },
      { $group: { _id: { $month: "$createdAt" }, total: { $sum: 1 }, flagged: { $sum: { $cond: ["$isFlagged", 1, 0] } } } },
      { $sort: { _id: 1 } }
    ]);

    res.json(momData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Exportable Reporting CSV (P2)
// @route   GET /api/admin/export-csv
const exportCSV = async (req, res) => {
  try {
    const reviews = await Review.find().populate('subjectId', 'name email').populate('managerId', 'name');
    
    let csv = 'ID,Subject,Manager,Type,Status,Flagged,Created At\n';
    reviews.forEach(r => {
      csv += `"${r._id}","${r.subjectId ? r.subjectId.name : 'Unknown'}","${r.managerId ? r.managerId.name : 'None'}","${r.type}","${r.status}","${r.isFlagged}","${r.createdAt}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=\"pms_report.csv\"');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Confirmation decision (Confirm | Extend)
// @route   PATCH /api/admin/probation/:userId
const probationDecision = async (req, res) => {
  const { decision } = req.body;
  const sendEmail = require('../utils/sendEmail');
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const mapping = {
      'Confirm': 'Closed',
      'Extend': 'Extended',
      'Review Further': 'Under Review'
    };
    user.probationStatus = mapping[decision] || 'Active';
    await user.save();

    try {
      await sendEmail({
        email: user.email,
        subject: `Probation Confirmation Outcome`,
        html: `<p>Hi ${user.name},</p><p>Your HR/Admin has recorded a confirmation decision. Status: <strong>${decision}</strong>.</p>`
      });
    } catch (emailErr) {
      console.error('Email failed but decision recorded:', emailErr);
    }

    res.json({ message: 'Decision recorded', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Active Probations for Admin UI
// @route   GET /api/admin/active-probations
const getActiveProbations = async (req, res) => {
  try {
    const active = await User.find({ probationStatus: 'Active' }).select('name email designation');
    res.json(active);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleProbationPause = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.probationStatus = user.probationStatus === 'Paused' ? 'Active' : 'Paused';
    await user.save();
    res.json({ message: `Probation ${user.probationStatus}`, status: user.probationStatus });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const reassignManager = async (req, res) => {
  const { newManagerId } = req.body;
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.managerId = newManagerId;
    await user.save();

    // Reassign any pending/incomplete reviews
    await Review.updateMany(
      { subjectId: user._id, status: { $ne: 'Closed' } },
      { managerId: newManagerId }
    );

    res.json({ message: 'Manager reassigned and pending reviews updated.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const handleReviewResolution = async (req, res) => {
  const { action, newDueDate, hrNote } = req.body; // 'Waive', 'Extend', 'Escalate'
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (hrNote) review.hrNote = hrNote;
    review.hrResolved = true; // Mark as processed in weekly review queue

    if (action === 'Waive') {
      review.status = 'Closed';
      review.contextNote = 'Review waived by Admin.';
    } else if (action === 'Extend') {
      review.dueDate = new Date(newDueDate);
      review.isFlagged = false; // Reset flag on extension
      review.contextNote = `Deadline extended to ${newDueDate} by Admin.`;
    } else if (action === 'Escalate') {
      review.isFlagged = true;
      review.contextNote = 'Hard escalation triggered by Admin.';
    }

    await review.save();
    res.json({ message: `Action ${action} recorded.`, review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrgGoals = async (req, res) => {
  try {
    const goals = await Goal.find({}).populate('ownerId', 'name email department');
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getOrgAggregation,
  getOrgGoals,
  getMonthOverMonth,
  exportCSV,
  probationDecision,
  getActiveProbations,
  toggleProbationPause,
  reassignManager,
  handleReviewResolution
};
