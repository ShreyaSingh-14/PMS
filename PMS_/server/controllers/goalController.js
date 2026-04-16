const Goal = require('../models/Goal');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// Helper function to calculate team/company aggregations
const calculateAggregations = async (userId, type) => {
  try {
    let aggregation = { count: 0, avgCompletion: 0, totalWeightage: 0 };

    if (type === 'team') {
      // Get all team members under this manager
      const teamUsers = await User.find({ managerId: userId }).select('_id');
      const userIds = teamUsers.map(u => u._id);

      if (userIds.length === 0) return aggregation;

      // Get all active goals for team members
      const teamGoals = await Goal.find({
        ownerId: { $in: userIds },
        status: 'Active'
      });

      if (teamGoals.length === 0) return aggregation;

      // Calculate weighted average completion
      let totalWeightedCompletion = 0;
      let totalWeightage = 0;

      teamGoals.forEach(goal => {
        const weight = goal.weightage || 0;
        const completion = goal.completionPercentage || 0;
        totalWeightedCompletion += (weight * completion);
        totalWeightage += weight;
      });

      aggregation = {
        count: teamGoals.length,
        avgCompletion: totalWeightage > 0 ? Math.round(totalWeightedCompletion / totalWeightage) : 0,
        totalWeightage: totalWeightage
      };

    } else if (type === 'company') {
      // Get all company goals
      const companyGoals = await Goal.find({
        type: 'Company',
        status: 'Active'
      });

      if (companyGoals.length === 0) return aggregation;

      const totalCompletion = companyGoals.reduce((sum, goal) => sum + (goal.completionPercentage || 0), 0);
      const totalWeightage = companyGoals.reduce((sum, goal) => sum + (goal.weightage || 0), 0);

      aggregation = {
        count: companyGoals.length,
        avgCompletion: companyGoals.length > 0 ? Math.round(totalCompletion / companyGoals.length) : 0,
        totalWeightage: totalWeightage
      };
    }

    return aggregation;
  } catch (error) {
    console.error('Aggregation calculation error:', error);
    return { count: 0, avgCompletion: 0, totalWeightage: 0 };
  }
};

// Get team aggregations for manager
const getTeamAggregations = async (req, res) => {
  try {
    const aggregation = await calculateAggregations(req.user._id, 'team');
    res.json(aggregation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get company aggregations for admin
const getCompanyAggregations = async (req, res) => {
  try {
    const aggregation = await calculateAggregations(null, 'company');
    res.json(aggregation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Transfer goal ownership when employee changes teams
const transferGoalOwnership = async (req, res) => {
  const { userId, newManagerId } = req.body;

  try {
    // Update user's manager
    await User.findByIdAndUpdate(userId, { managerId: newManagerId });

    // Transfer active goals ownership (goals follow employee)
    const updatedGoals = await Goal.updateMany(
      { ownerId: userId, status: { $in: ['Active', 'Pending Approval'] } },
      {
        $push: {
          notes: {
            content: `Goal ownership transferred due to team change. Previous manager retains view access.`,
            date: new Date()
          }
        }
      }
    );

    res.json({
      message: `Goals ownership maintained for employee. ${updatedGoals.modifiedCount} goals updated.`,
      goalsTransferred: updatedGoals.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update company goal and notify team owners
const updateCompanyGoal = async (req, res) => {
  const { goalId, updates } = req.body;

  try {
    const goal = await Goal.findById(goalId);
    if (!goal || goal.type !== 'Company') {
      return res.status(404).json({ message: 'Company goal not found' });
    }

    // Update the company goal
    Object.keys(updates).forEach(key => {
      if (key !== 'acknowledgments') { // Don't allow direct acknowledgment updates
        goal[key] = updates[key];
      }
    });

    // Add update note
    goal.notes.push({
      content: `Company goal updated mid-cycle. Team owners have 5 days to acknowledge changes.`,
      date: new Date()
    });

    await goal.save();

    // Find all cascaded goals (team and individual) that reference this company goal
    const cascadedGoals = await Goal.find({
      $or: [
        { parentGoalId: goalId },
        { parentGoalId: { $in: await Goal.find({ parentGoalId: goalId }).distinct('_id') } }
      ]
    }).populate('ownerId', 'email name');

    // Notify team owners about the change
    const notifiedOwners = new Set();
    for (let cascadedGoal of cascadedGoals) {
      if (cascadedGoal.ownerId && cascadedGoal.ownerId.email && !notifiedOwners.has(cascadedGoal.ownerId._id.toString())) {
        notifiedOwners.add(cascadedGoal.ownerId._id.toString());

        await sendEmail({
          email: cascadedGoal.ownerId.email,
          subject: `Company Goal Updated: ${goal.title}`,
          html: `
            <h3>Company Goal Update</h3>
            <p>The company goal "${goal.title}" has been updated.</p>
            <p><strong>Changes:</strong> ${updates.title || updates.description || 'Goal details modified'}</p>
            <p>You have 5 business days to review and acknowledge these changes. Your cascaded goals may need adjustment.</p>
            <p>Please log in to review the updated company objectives.</p>
          `
        }).catch(err => console.error('Email notification failed:', err));
      }
    }

    res.json({
      message: 'Company goal updated and notifications sent',
      goal,
      notificationsSent: notifiedOwners.size
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Acknowledge company goal changes
const acknowledgeCompanyGoalUpdate = async (req, res) => {
  const { goalId } = req.body;

  try {
    const goal = await Goal.findById(goalId);
    if (!goal || goal.type !== 'Company') {
      return res.status(404).json({ message: 'Company goal not found' });
    }

    // Find user's cascaded goals
    const userCascadedGoals = await Goal.find({
      ownerId: req.user._id,
      $or: [
        { parentGoalId: goalId },
        { parentGoalId: { $in: await Goal.find({ parentGoalId: goalId }).distinct('_id') } }
      ]
    });

    // Mark acknowledgment
    for (let userGoal of userCascadedGoals) {
      userGoal.notes.push({
        content: `Acknowledged company goal update for "${goal.title}"`,
        date: new Date()
      });
      await userGoal.save();
    }

    res.json({
      message: 'Company goal changes acknowledged',
      acknowledgedGoals: userCascadedGoals.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get active goals count for user (used by review blocking)
const getActiveGoalsCount = async (req, res) => {
  try {
    const activeGoalsCount = await Goal.countDocuments({
      ownerId: req.user._id,
      status: 'Active'
    });

    res.json({ activeGoalsCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createGoal = async (req, res) => {
  const { title, description, type, deadline, subtasks, parentGoalId } = req.body;
  try {
    if (!req.user || !req.user._id) {
       return res.status(401).json({ message: 'User session expired. Please re-login.' });
    }
    
    const goal = await Goal.create({
      title,
      description,
      ownerId: req.user._id,
      type: type || 'Individual',
      status: (type === 'Individual' || !type) ? 'Draft' : 'Active',
      deadline: deadline ? new Date(deadline) : undefined,
      subtasks: subtasks || [],
      parentGoalId
    });
    res.status(201).json(goal);
  } catch (error) {
    console.error("GOAL CREATION ERROR:", error);
    res.status(500).json({ message: `Database Error: ${error.message}` });
  }
};

const getMyGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ ownerId: req.user._id });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTeamGoals = async (req, res) => {
  try {
    const teamUsers = await User.find({ managerId: req.user._id }).select('_id');
    const userIds = teamUsers.map(u => u._id);
    userIds.push(req.user._id); // Include manager's own goals (Team type etc)
    
    const goals = await Goal.find({ ownerId: { $in: userIds } }).populate('ownerId', 'name email');
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveGoal = async (req, res) => {
  const { weightage, isRejected, reason, deadline } = req.body;
  const sendEmail = require('../utils/sendEmail');

  try {
    const goal = await Goal.findById(req.params.id).populate('ownerId');
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    if (isRejected) {
      goal.status = 'Draft';
      await goal.save();
      // Non-blocking email notification
      sendEmail({
        email: goal.ownerId.email,
        subject: 'Goal Revision Requested',
        html: `<p>Goal "${goal.title}" rejected. Reason: ${reason}</p>`
      }).catch(err => console.error("EMAIL_FAILURE: Rejected goal notification could not be sent:", err.message));
      
      return res.json(goal);
    }

    // P0: Weightage validation
    // Check total weightage for this owner
    if (weightage) {
        const userGoals = await Goal.find({ ownerId: goal.ownerId._id, status: 'Active', _id: { $ne: goal._id } });
        const currentTotal = userGoals.reduce((sum, g) => sum + (g.weightage || 0), 0);
        if (currentTotal + weightage > 100) {
            return res.status(400).json({ message: `Weightage Overflow. User already has ${currentTotal}%. Total cannot exceed 100%.` });
        }
        goal.weightage = weightage;
    }

    if (deadline) goal.deadline = deadline;
    goal.status = 'Active';
    await goal.save();
    
    // Non-blocking email notification
    sendEmail({
      email: goal.ownerId.email,
      subject: 'Goal Approved & Active',
      html: `<p>Your goal "${goal.title}" is now Active with ${weightage}% weighting.</p>`
    }).catch(err => console.error("EMAIL_FAILURE: Approval notification could not be sent:", err.message));

    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateGoalCompletion = async (req, res) => {
  const { completionPercentage, isCompleted, note, blocker, status, title, description, deadline } = req.body;
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    const isOwner = goal.ownerId.toString() === req.user._id.toString();
    const isManagerOrAdmin = req.user.role === 'Manager' || req.user.role === 'Admin';
    if (!isOwner && !isManagerOrAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this goal' });
    }

    if (title) goal.title = title;
    if (description) goal.description = description;
    if (deadline) goal.deadline = new Date(deadline);

    if (status) {
      const allowedStatuses = ['Draft', 'Pending Approval', 'Active', 'Completed', 'Archived'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status update' });
      }
      // Employees can move their own drafts into pending approval and back to draft.
      if (isOwner) {
        if (['Draft', 'Pending Approval', 'Completed', 'Archived'].includes(status)) {
          goal.status = status;
        }
      } else if (isManagerOrAdmin) {
        goal.status = status;
      }
    }

    if (completionPercentage !== undefined) goal.completionPercentage = completionPercentage;
    if (isCompleted) goal.status = 'Completed';
    if (note) goal.notes.push({ content: note });
    if (blocker) goal.blockers.push({ issue: blocker });
    
    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    // Only the owner can delete, and only Draft goals may be deleted
    if (goal.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this goal' });
    }
    if (goal.status !== 'Draft') {
      return res.status(400).json({ message: 'Only Draft goals can be deleted' });
    }

    await Goal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Draft goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const archiveGoal = async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);
        if (!goal) return res.status(404).json({ message: 'Goal not found' });
        
        goal.status = 'Archived';
        await goal.save();
        res.json({ message: 'Goal archived successfully' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const toggleSubtask = async (req, res) => {
  const { goalId, subtaskId } = req.params;
  try {
    const goal = await Goal.findById(goalId);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    const subtask = goal.subtasks.id(subtaskId);
    if (!subtask) return res.status(404).json({ message: 'Subtask not found' });

    subtask.isCompleted = !subtask.isCompleted;

    // Recalculate completion percentage
    const completedCount = goal.subtasks.filter(s => s.isCompleted).length;
    goal.completionPercentage = Math.round((completedCount / goal.subtasks.length) * 100);

    if (goal.completionPercentage === 100) {
      goal.status = 'Completed';
    } else {
      goal.status = 'Active';
    }

    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createGoal,
  getMyGoals,
  getTeamGoals,
  approveGoal,
  updateGoalCompletion,
  toggleSubtask,
  archiveGoal,
  deleteGoal,
  getTeamAggregations,
  getCompanyAggregations,
  transferGoalOwnership,
  updateCompanyGoal,
  acknowledgeCompanyGoalUpdate,
  getActiveGoalsCount
};
