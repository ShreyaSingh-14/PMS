const express = require('express');
const router = express.Router();
const { 
  getDashboardStats, 
  getOrgAggregation, 
  getOrgGoals,
  getMonthOverMonth, 
  exportCSV, 
  probationDecision, 
  getActiveProbations, 
  handleReviewResolution,
  toggleProbationPause,
  reassignManager
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/org-goals').get(protect, admin, getOrgGoals);

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin and HR operations
 */

/**
 * @swagger
 * /api/admin/dashboard-stats:
 *   get:
 *     summary: Get dashboard statistics including compliance and flagged reviews
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved stats
 */
router.route('/dashboard-stats').get(protect, admin, getDashboardStats);

/**
 * @swagger
 * /api/admin/org-aggregation:
 *   get:
 *     summary: Get goal aggregations at Company, Team, and Individual levels
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched aggregations
 */
router.route('/org-aggregation').get(protect, admin, getOrgAggregation);

/**
 * @swagger
 * /api/admin/mom-comparison:
 *   get:
 *     summary: Get month-over-month cycle comparisons
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historic data fetched
 */
router.route('/mom-comparison').get(protect, admin, getMonthOverMonth);

/**
 * @swagger
 * /api/admin/export-csv:
 *   get:
 *     summary: Export full compliance and system data as CSV
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV buffer stream
 */
router.route('/export-csv').get(protect, admin, exportCSV);

/**
 * @swagger
 * /api/admin/probation/{userId}:
 *   patch:
 *     summary: Make a final confirmation decision on an employee probation
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
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
 *               decision:
 *                 type: string
 *                 enum: [Confirm, Extend]
 *     responses:
 *       200:
 *         description: Decision locked
 */
router.route('/probation/:userId').patch(protect, admin, probationDecision);

/**
 * @swagger
 * /api/admin/active-probations:
 *   get:
 *     summary: Get list of active probations needing confirmation
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fetched list of employees
 */
router.route('/active-probations').get(protect, admin, getActiveProbations);

/**
 * @swagger
 * /api/admin/probation/{userId}/pause:
 *   patch:
 *     summary: Toggle pause/active status for probation clock
 *     tags: [Admin]
 */
router.route('/probation/:userId/pause').patch(protect, admin, require('../controllers/adminController').toggleProbationPause);

/**
 * @swagger
 * /api/admin/probation/{userId}/reassign:
 *   patch:
 *     summary: Reassign manager mid-probation and update pending forms
 *     tags: [Admin]
 */
router.route('/probation/:userId/reassign').patch(protect, admin, require('../controllers/adminController').reassignManager);

/**
 * @swagger
 * /api/admin/resolve-review/{id}:
 *   patch:
 *     summary: Resolve a flagged review by waiving, extending, or escalating
 *     tags: [Admin]
 */
router.route('/resolve-review/:id').patch(protect, admin, handleReviewResolution);

module.exports = router;
