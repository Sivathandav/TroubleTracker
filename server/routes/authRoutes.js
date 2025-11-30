const express = require('express');
const router = express.Router();
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');
const {
  signup,
  login,
  verifyToken,
  checkAdmin,
  registerTeamMember,
} = require('../controllers/authController');

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.get('/check-admin', checkAdmin);

// Protected routes
router.get('/verify', authMiddleware, verifyToken);

// Admin-only routes
router.post('/register', authMiddleware, adminOnly, registerTeamMember);

module.exports = router;
