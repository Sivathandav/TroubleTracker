const express = require('express');
const router = express.Router();
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');
const {
  getMissedChatsByWeek,
  getAvgReplyTime,
  getResolutionRate,
  getDashboardAnalytics,
} = require('../controllers/analyticsController');

// Analytics routes - accessible to all authenticated users
router.get('/missed-chats', authMiddleware, getMissedChatsByWeek);
router.get('/avg-reply-time', authMiddleware, getAvgReplyTime);
router.get('/resolution-rate', authMiddleware, getResolutionRate);
router.get('/dashboard', authMiddleware, getDashboardAnalytics);

module.exports = router;
