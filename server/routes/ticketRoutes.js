const express = require('express');
const router = express.Router();
const {
  authMiddleware,
  adminOnly,
  teamMemberOrAdmin,
} = require('../middleware/authMiddleware');
const {
  createTicket,
  getTickets,
  getTicketById,
  assignTicket,
  addMessage,
  resolveTicket,
  searchTickets,
} = require('../controllers/ticketController');

// Public routes
router.post('/create', createTicket);

// Protected routes (team member or admin)
router.get('/', authMiddleware, teamMemberOrAdmin, getTickets);
router.get('/search', authMiddleware, teamMemberOrAdmin, searchTickets);
// Get ticket by ID - allow both authenticated and unauthenticated requests
router.get('/:id', (req, res, next) => {
  // Try to authenticate, but don't fail if no token
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    authMiddleware(req, res, next);
  } else {
    next();
  }
}, getTicketById);
// Messages endpoint - allow both authenticated and unauthenticated requests
router.post('/:id/messages', (req, res, next) => {
  // Try to authenticate, but don't fail if no token
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    authMiddleware(req, res, next);
  } else {
    next();
  }
}, addMessage);
router.put('/:id/resolve', authMiddleware, teamMemberOrAdmin, resolveTicket);

// Admin-only routes
router.put('/:id/assign', authMiddleware, adminOnly, assignTicket);

// Mark ticket as missed chat
router.put('/:id/mark-missed', authMiddleware, teamMemberOrAdmin, async (req, res) => {
  try {
    const Ticket = require('../models/Ticket');
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    // Mark as missed chat
    ticket.isMissedChat = true;
    ticket.missedChatMarkedAt = new Date();
    await ticket.save();

    res.status(200).json({
      success: true,
      message: 'Chat marked as missed',
      ticket,
    });
  } catch (error) {
    console.error('Error marking missed chat:', error);
    res.status(500).json({
      success: false,
      message: 'Server error marking missed chat',
    });
  }
});

module.exports = router;
