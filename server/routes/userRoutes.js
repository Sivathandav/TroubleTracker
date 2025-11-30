const express = require('express');
const router = express.Router();
const {
  authMiddleware,
  adminOnly,
  teamMemberOrAdmin,
} = require('../middleware/authMiddleware');
const {
  getTeamMembers,
  addTeamMember,
  editTeamMember,
  deleteTeamMember,
  updateProfile,
  changePassword,
} = require('../controllers/userController');

// Routes for viewing team members (admin and team members)
router.get('/team', authMiddleware, teamMemberOrAdmin, getTeamMembers);

// Admin-only routes
router.post('/team', authMiddleware, adminOnly, addTeamMember);
router.delete('/team/:id', authMiddleware, adminOnly, deleteTeamMember);

// Edit team member - admin can edit anyone, members can edit themselves
router.put('/team/:id', authMiddleware, teamMemberOrAdmin, editTeamMember);

// Protected routes (all authenticated users)
router.put('/profile', authMiddleware, teamMemberOrAdmin, updateProfile);
router.put('/password', authMiddleware, teamMemberOrAdmin, changePassword);

module.exports = router;
