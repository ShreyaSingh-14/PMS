const express = require('express');
const router = express.Router();
const {
  createGoal,
  getMyGoals,
  getTeamGoals,
  updateGoalCompletion,
  toggleSubtask,
  approveGoal
} = require('../controllers/goalController');
const { protect, manager } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Goals
 *   description: Goal Management System (GMS) Operations
 */

/**
 * @swagger
 * /api/goals:
 *   post:
 *     summary: Create a new custom or cascaded goal
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Goal draft created
 */
router.route('/').post(protect, createGoal);

/**
 * @swagger
 * /api/goals/my-goals:
 *   get:
 *     summary: Fetch current user's goals
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of connected goals
 */
router.route('/my-goals').get(protect, getMyGoals);

/**
 * @swagger
 * /api/goals/team-goals:
 *   get:
 *     summary: Fetch all goals owned by team members managed by logined manager
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of team goals
 */
router.route('/team-goals').get(protect, manager, getTeamGoals);

/**
 * @swagger
 * /api/goals/{id}:
 *   patch:
 *     summary: Update completion percentage of a specific goal
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               completionPercentage:
 *                 type: number
 *     responses:
 *       200:
 *         description: Goal percentage updated
 */
router.route('/:id').patch(protect, updateGoalCompletion);

/**
 * @swagger
 * /api/goals/{goalId}/subtasks/{subtaskId}/toggle:
 *   patch:
 *     summary: Toggle subtask completion and auto-update goal percentage
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *       - in: path
 *         name: subtaskId
 *         required: true
 */
router.route('/:goalId/subtasks/:subtaskId/toggle').patch(protect, toggleSubtask);

/**
 * @swagger
 * /api/goals/{id}/approve:
 *   patch:
 *     summary: Manager/Admin approve goal configuration and inject weightage
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               weightage:
 *                 type: number
 *               isRejected:
 *                 type: boolean
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status patched to Active/Draft
 */
router.route('/:id/approve').patch(protect, manager, approveGoal);

module.exports = router;
