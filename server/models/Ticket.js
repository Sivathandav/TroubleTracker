const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
  },
  senderType: {
    type: String,
    enum: ['user', 'team'],
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ticketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  userContactInfo: {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true,
  },
  status: {
    type: String,
    enum: ['unresolved', 'resolved'],
    default: 'unresolved',
    index: true,
  },
  messages: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  resolvedAt: {
    type: Date,
    default: null,
  },
  firstReplyAt: {
    type: Date,
    default: null,
  },
  isMissedChat: {
    type: Boolean,
    default: false,
    index: true,
  },
  missedChatMarkedAt: {
    type: Date,
    default: null,
  },
});

// Virtual field to compute if chat was missed
ticketSchema.virtual('missedChat').get(function () {
  // If there's no first reply and ticket is older than threshold (5 minutes default)
  if (!this.firstReplyAt && this.status === 'unresolved') {
    const thresholdMinutes = 5; // This should come from Customization settings
    const thresholdMs = thresholdMinutes * 60 * 1000;
    const timeSinceCreation = Date.now() - this.createdAt.getTime();
    return timeSinceCreation > thresholdMs;
  }
  return false;
});

// Generate unique ticket ID
ticketSchema.statics.generateTicketId = async function () {
  const year = new Date().getFullYear();
  const count = await this.countDocuments();
  const ticketNumber = String(count + 1).padStart(5, '0');
  return `${year}-${ticketNumber}`;
};

// Indexes for performance
ticketSchema.index({ ticketId: 1 });
ticketSchema.index({ assignedTo: 1 });
ticketSchema.index({ status: 1 });
ticketSchema.index({ createdAt: -1 });

// Ensure virtuals are included in JSON
ticketSchema.set('toJSON', { virtuals: true });
ticketSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Ticket', ticketSchema);
