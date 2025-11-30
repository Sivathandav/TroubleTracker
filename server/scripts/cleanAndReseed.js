require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Ticket = require('../models/Ticket');

async function cleanAndReseed() {
  try {
    await connectDB();
    console.log('Connected to MongoDB\n');

    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║           CLEAN AND RESEED TICKETS                            ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    // Delete all tickets
    console.log('🗑️  Deleting All Tickets');
    console.log('─'.repeat(60));
    
    const deleteResult = await Ticket.deleteMany({});
    console.log(`✓ Deleted ${deleteResult.deletedCount} tickets\n`);

    // Create fresh 20 tickets with realistic data
    console.log('📝 Creating 20 Fresh Tickets');
    console.log('─'.repeat(60));
    
    const ticketData = [
      { name: 'John Smith', email: 'john@example.com', phone: '+1-555-1001', subject: 'Account access issue' },
      { name: 'Emma Wilson', email: 'emma@example.com', phone: '+1-555-1002', subject: 'Payment failed' },
      { name: 'David Brown', email: 'david@example.com', phone: '+1-555-1003', subject: 'Feature request' },
      { name: 'Lisa Anderson', email: 'lisa@example.com', phone: '+1-555-1004', subject: 'Bug report' },
      { name: 'James Taylor', email: 'james@example.com', phone: '+1-555-1005', subject: 'Integration help' },
      { name: 'Maria Garcia', email: 'maria@example.com', phone: '+1-555-1006', subject: 'Billing question' },
      { name: 'Robert Lee', email: 'robert@example.com', phone: '+1-555-1007', subject: 'Technical support' },
      { name: 'Jennifer White', email: 'jennifer@example.com', phone: '+1-555-1008', subject: 'Account upgrade' },
      { name: 'Michael Davis', email: 'michael@example.com', phone: '+1-555-1009', subject: 'Data export' },
      { name: 'Sarah Martinez', email: 'sarah.m@example.com', phone: '+1-555-1010', subject: 'API documentation' },
      { name: 'Christopher Jones', email: 'chris@example.com', phone: '+1-555-1011', subject: 'Performance issue' },
      { name: 'Amanda Clark', email: 'amanda@example.com', phone: '+1-555-1012', subject: 'Mobile app crash' },
      { name: 'Daniel Rodriguez', email: 'daniel@example.com', phone: '+1-555-1013', subject: 'Login timeout' },
      { name: 'Rachel Green', email: 'rachel@example.com', phone: '+1-555-1014', subject: 'Report generation' },
      { name: 'Kevin Thompson', email: 'kevin@example.com', phone: '+1-555-1015', subject: 'Custom branding' },
      { name: 'Victoria King', email: 'victoria@example.com', phone: '+1-555-1016', subject: 'Team permissions' },
      { name: 'Brandon Scott', email: 'brandon@example.com', phone: '+1-555-1017', subject: 'Webhook setup' },
      { name: 'Olivia Harris', email: 'olivia@example.com', phone: '+1-555-1018', subject: 'Calendar sync' },
      { name: 'Nathan Wright', email: 'nathan@example.com', phone: '+1-555-1019', subject: 'Search not working' },
      { name: 'Sophie Turner', email: 'sophie@example.com', phone: '+1-555-1020', subject: 'Notification settings' }
    ];

    const createdTickets = [];
    const now = new Date();

    for (let i = 0; i < ticketData.length; i++) {
      const data = ticketData[i];
      const ticketId = `2025-${String(200 + i).padStart(5, '0')}`;
      
      // Determine if ticket should be resolved or unresolved
      const isResolved = i % 3 === 0; // 1/3 resolved
      
      // Determine if ticket should have a reply
      const hasReply = i % 2 === 0; // 1/2 have replies
      
      // Create ticket with recent timestamps
      const createdAt = new Date(now.getTime() - (i * 2 * 60 * 1000)); // Each ticket 2 minutes apart
      
      let firstReplyAt = null;
      if (hasReply) {
        // Reply within 5-30 minutes of creation
        const replyDelayMinutes = 5 + Math.random() * 25;
        firstReplyAt = new Date(createdAt.getTime() + replyDelayMinutes * 60 * 1000);
      }
      
      const ticket = new Ticket({
        ticketId,
        userContactInfo: {
          name: data.name,
          email: data.email,
          phone: data.phone
        },
        messages: [
          {
            sender: data.name,
            senderType: 'user',
            body: data.subject
          }
        ],
        status: isResolved ? 'resolved' : 'unresolved',
        createdAt,
        assignedTo: null,
        firstReplyAt,
        resolvedAt: isResolved ? new Date() : null
      });

      createdTickets.push(ticket);
    }

    await Ticket.insertMany(createdTickets);
    console.log(`✓ Created 20 fresh tickets\n`);

    // Show statistics
    console.log('📊 Fresh Ticket Statistics');
    console.log('─'.repeat(60));
    
    const resolved = createdTickets.filter(t => t.status === 'resolved').length;
    const unresolved = createdTickets.filter(t => t.status === 'unresolved').length;
    const withReply = createdTickets.filter(t => t.firstReplyAt).length;
    const withoutReply = createdTickets.filter(t => !t.firstReplyAt).length;
    
    console.log(`Total: ${createdTickets.length}`);
    console.log(`├─ Resolved: ${resolved}`);
    console.log(`├─ Unresolved: ${unresolved}`);
    console.log(`├─ With Replies: ${withReply}`);
    console.log(`└─ Without Replies: ${withoutReply}\n`);

    // Calculate average reply time
    const ticketsWithReply = createdTickets.filter(t => t.firstReplyAt);
    if (ticketsWithReply.length > 0) {
      const totalReplyTime = ticketsWithReply.reduce((sum, ticket) => {
        return sum + (ticket.firstReplyAt - ticket.createdAt);
      }, 0);
      const avgReplyTimeMs = totalReplyTime / ticketsWithReply.length;
      const avgReplyTimeMinutes = Math.round(avgReplyTimeMs / (60 * 1000));
      const avgReplyTimeHours = (avgReplyTimeMinutes / 60).toFixed(1);
      
      console.log(`Average Reply Time: ${avgReplyTimeHours}h (${avgReplyTimeMinutes}m)\n`);
    }

    console.log('═'.repeat(60));
    console.log('✅ CLEAN AND RESEED COMPLETE');
    console.log('═'.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

cleanAndReseed();
