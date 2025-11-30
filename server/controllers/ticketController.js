const Ticket = require('../models/Ticket');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Create new ticket (external user)
// @route   POST /api/tickets/create
// @access  Public
const createTicket = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validate input
    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and phone',
      });
    }

    // Generate unique ticket ID
    const ticketId = await Ticket.generateTicketId();

    // Create initial message if provided
    const messages = message
      ? [
          {
            sender: name,
            senderType: 'user',
            body: message,
            timestamp: new Date(),
          },
        ]
      : [];

    // Create ticket
    const ticket = await Ticket.create({
      ticketId,
      userContactInfo: { name, email, phone },
      messages,
      status: 'unresolved',
    });

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      ticket: {
        ticketId: ticket.ticketId,
        _id: ticket._id,
      },
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating ticket',
      error: error.message,
    });
  }
};

// @desc    Get all tickets with filters
// @route   GET /api/tickets
// @access  Protected
const getTickets = async (req, res) => {
  try {
    const { status, assignedTo } = req.query;
    const filter = {};

    // Apply filters
    if (status && status !== 'all') {
      filter.status = status;
    }

    // If user is team member, only show their assigned tickets
    if (req.user.role === 'team_member') {
      filter.assignedTo = req.user.id;
    } else if (assignedTo) {
      // Admin can filter by assignedTo
      filter.assignedTo = assignedTo;
    }

    const tickets = await Ticket.find(filter)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching tickets',
    });
  }
};

// @desc    Get single ticket details
// @route   GET /api/tickets/:id
// @access  Protected
const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate(
      'assignedTo',
      'name email'
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    // Check access permissions - only if user is authenticated
    if (req.user) {
      if (req.user.role === 'team_member') {
        // Team members can only access their assigned tickets
        if (!ticket.assignedTo || ticket.assignedTo._id.toString() !== req.user.id.toString()) {
          return res.status(403).json({
            success: false,
            message: 'Access denied. This ticket is not assigned to you.',
          });
        }
      }
    }
    // If not authenticated, allow public access to view ticket messages

    res.status(200).json({
      success: true,
      ticket,
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching ticket',
    });
  }
};

// @desc    Assign ticket to team member
// @route   PUT /api/tickets/:id/assign
// @access  Protected (Admin only)
const assignTicket = async (req, res) => {
  try {
    const { teamMemberId } = req.body;

    if (!teamMemberId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide team member ID',
      });
    }

    // Verify team member exists
    const teamMember = await User.findById(teamMemberId);
    if (!teamMember || teamMember.role !== 'team_member') {
      return res.status(400).json({
        success: false,
        message: 'Invalid team member ID',
      });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    // Assign ticket
    ticket.assignedTo = teamMemberId;
    await ticket.save();

    const updatedTicket = await Ticket.findById(ticket._id).populate(
      'assignedTo',
      'name email'
    );

    res.status(200).json({
      success: true,
      message: 'Ticket assigned successfully',
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error('Assign ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error assigning ticket',
    });
  }
};

// @desc    Add message to ticket
// @route   POST /api/tickets/:id/messages
// @access  Protected
const addMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message',
      });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    // Determine sender type and name
    let senderType = 'user';
    let senderName = 'User';

    // If authenticated, it's a team member response
    if (req.user) {
      // Check if user is assigned to this ticket (for team members)
      if (req.user.role === 'team_member') {
        if (!ticket.assignedTo || ticket.assignedTo.toString() !== req.user.id.toString()) {
          return res.status(403).json({
            success: false,
            message: 'Access denied. You are not assigned to this ticket.',
          });
        }
      }
      senderType = 'team';
      senderName = req.user.name;
    } else {
      // Unauthenticated message from FloatingChatWidget user
      senderType = 'user';
      senderName = ticket.userContactInfo?.name || 'User';
    }

    // Add message
    const newMessage = {
      sender: senderName,
      senderType,
      body: message,
      timestamp: new Date(),
    };

    ticket.messages.push(newMessage);

    // Set first reply time if this is the first team response
    if (!ticket.firstReplyAt) {
      ticket.firstReplyAt = new Date();
    }

    await ticket.save();

    res.status(200).json({
      success: true,
      message: 'Message added successfully',
      ticket,
    });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding message',
    });
  }
};

// @desc    Mark ticket as resolved
// @route   PUT /api/tickets/:id/resolve
// @access  Protected
const resolveTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    // Check if user is assigned to this ticket (for team members)
    if (req.user.role === 'team_member') {
      if (!ticket.assignedTo || ticket.assignedTo.toString() !== req.user.id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You are not assigned to this ticket.',
        });
      }
    }

    ticket.status = 'resolved';
    ticket.resolvedAt = new Date();
    await ticket.save();

    res.status(200).json({
      success: true,
      message: 'Ticket marked as resolved',
      ticket,
    });
  } catch (error) {
    console.error('Resolve ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error resolving ticket',
    });
  }
};

// @desc    Search tickets by ticket ID
// @route   GET /api/tickets/search
// @access  Protected
const searchTickets = async (req, res) => {
  try {
    const { ticketId } = req.query;

    if (!ticketId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide ticket ID',
      });
    }

    const filter = { ticketId: { $regex: ticketId, $options: 'i' } };

    // Team members can only search their assigned tickets
    if (req.user.role === 'team_member') {
      filter.assignedTo = req.user.id;
    }

    const tickets = await Ticket.find(filter)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error('Search tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching tickets',
    });
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  assignTicket,
  addMessage,
  resolveTicket,
  searchTickets,
};
