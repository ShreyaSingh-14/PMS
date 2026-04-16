const express = require('express');
const router = express.Router();
const { 
  getPendingReviews, 
  getReviewHistory, 
  submitSelfFeedback, 
  submitManagerFeedback,
  scheduleDiscussion 
} = require('../controllers/reviewController');
const { protect, manager } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Performance array feedback operations
 */

/**
 * @swagger
 * /api/reviews/pending:
 *   get:
 *     summary: Provide queue of actionable reviews
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payload returned
 */
router.route('/pending').get(protect, getPendingReviews);

/**
 * @swagger
 * /api/reviews/history:
 *   get:
 *     summary: Provided entirely cross-shared / closed review context bounds
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data generated successfully
 */
router.route('/history').get(protect, getReviewHistory);

/**
 * @swagger
 * /api/reviews/{id}/self-feedback:
 *   post:
 *     summary: Emits employee rating block inside review matrix
 *     tags: [Reviews]
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
 *               progress:
 *                 type: string
 *               rating:
 *                 type: string
 *     responses:
 *       200:
 *         description: Submittal achieved state change
 */
router.route('/:id/self-feedback').post(protect, submitSelfFeedback);

/**
 * @swagger
 * /api/reviews/{id}/manager-feedback:
 *   post:
 *     summary: Extrapolate manager confirmation array & close review context out securely.
 *     tags: [Reviews]
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
 *               comments:
 *                 type: string
 *               rating:
 *                 type: string
 *     responses:
 *       200:
 *         description: Submittal completed natively
 */
router.route('/:id/manager-feedback').post(protect, submitManagerFeedback);

/**
 * @swagger
 * /api/reviews/{id}/schedule:
 *   patch:
 *     summary: Configure final discussion boundaries natively
 *     tags: [Reviews]
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
 *               date:
 *                 type: string
 *     responses:
 *       200:
 *         description: State patched securely via parameters
 */
router.route('/:id/schedule').patch(protect, scheduleDiscussion);

module.exports = router;
