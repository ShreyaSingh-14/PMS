const express = require('express');
const router = express.Router();
const adminCycleController = require('../controllers/adminCycleController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes require authentication and Admin role
router.get('/cycles', protect, admin, adminCycleController.getActiveCycles);
router.get('/cycles/:cycleId', protect, admin, adminCycleController.getCycleDetail);
router.patch('/cycles/:cycleId/close', protect, admin, adminCycleController.closeCycle);

// Bulk actions for unsubmitted reviews
router.post('/reviews/bulk-extend', protect, admin, adminCycleController.bulkExtendReviews);
router.post('/reviews/bulk-waive', protect, admin, adminCycleController.bulkWaiveReviews);

// Audit trail
router.get('/reviews/:reviewId/audit-trail', protect, admin, adminCycleController.getReviewAuditTrail);

module.exports = router;
