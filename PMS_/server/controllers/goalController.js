const Goal = require('../models/Goal');
const User = require('../models/User');

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
      status: (type === 'Individual' || !type) ? 'Pending Approval' : 'Active',
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
  const { completionPercentage, isCompleted, note, blocker } = req.body;
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    
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
  archiveGoal
};
