require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Ticket = require('../models/Ticket');

async function addMoreTickets() {
  try {
    await connectDB();
    console.log('Connected to MongoDB\n');

    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║           ADDING 30 MORE TICKETS                              ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    const ticketData = [
      { name: 'Alex Murphy', email: 'alex@example.com', phone: '+1-555-2001', subject: 'Dashboard customization' },
      { name: 'Nicole Bell', email: 'nicole@example.com', phone: '+1-555-2002', subject: 'Export to CSV' },
      { name: 'Marcus Johnson', email: 'marcus@example.com', phone: '+1-555-2003', subject: 'Two-factor auth setup' },
      { name: 'Sophia Chen', email: 'sophia@example.com', phone: '+1-555-2004', subject: 'Bulk import users' },
      { name: 'Tyler Moore', email: 'tyler@example.com', phone: '+1-555-2005', subject: 'API rate limits' },
      { name: 'Isabella Rodriguez', email: 'isabella@example.com', phone: '+1-555-2006', subject: 'SSO integration' },
      { name: 'Ethan Jackson', email: 'ethan@example.com', phone: '+1-555-2007', subject: 'Backup restoration' },
      { name: 'Mia Patel', email: 'mia@example.com', phone: '+1-555-2008', subject: 'Audit logs access' },
      { name: 'Lucas Anderson', email: 'lucas@example.com', phone: '+1-555-2009', subject: 'Custom domain setup' },
      { name: 'Ava Thompson', email: 'ava@example.com', phone: '+1-555-2010', subject: 'Rate limiting issue' },
      { name: 'Mason Harris', email: 'mason@example.com', phone: '+1-555-2011', subject: 'Webhook debugging' },
      { name: 'Charlotte Martin', email: 'charlotte@example.com', phone: '+1-555-2012', subject: 'Database migration' },
      { name: 'Logan Garcia', email: 'logan@example.com', phone: '+1-555-2013', subject: 'Load balancing' },
      { name: 'Amelia Robinson', email: 'amelia@example.com', phone: '+1-555-2014', subject: 'Cache invalidation' },
      { name: 'Benjamin Clark', email: 'benjamin@example.com', phone: '+1-555-2015', subject: 'Session timeout' },
      { name: 'Harper Lewis', email: 'harper@example.com', phone: '+1-555-2016', subject: 'CORS configuration' },
      { name: 'Henry Walker', email: 'henry@example.com', phone: '+1-555-2017', subject: 'SSL certificate' },
      { name: 'Evelyn Hall', email: 'evelyn@example.com', phone: '+1-555-2018', subject: 'DNS records' },
      { name: 'Alexander Young', email: 'alexander@example.com', phone: '+1-555-2019', subject: 'CDN setup' },
      { name: 'Abigail Hernandez', email: 'abigail@example.com', phone: '+1-555-2020', subject: 'Load testing' },
      { name: 'Michael King', email: 'michael.k@example.com', phone: '+1-555-2021', subject: 'Monitoring alerts' },
      { name: 'Elizabeth Wright', email: 'elizabeth@example.com', phone: '+1-555-2022', subject: 'Log aggregation' },
      { name: 'Jacob Lopez', email: 'jacob@example.com', phone: '+1-555-2023', subject: 'Metrics dashboard' },
      { name: 'Ella Hill', email: 'ella@example.com', phone: '+1-555-2024', subject: 'Alerting rules' },
      { name: 'Logan Scott', email: 'logan.s@example.com', phone: '+1-555-2025', subject: 'Incident response' },
      { name: 'Grace Green', email: 'grace@example.com', phone: '+1-555-2026', subject: 'Disaster recovery' },
      { name: 'Jackson Adams', email: 'jackson@example.com', phone: '+1-555-2027', subject: 'Failover testing' },
      { name: 'Chloe Nelson', email: 'chloe@example.com', phone: '+1-555-2028', subject: 'Redundancy setup' },
      { name: 'Aiden Carter', email: 'aiden@example.com', phone: '+1-555-2029', subject: 'Replication lag' },
      { name: 'Lily Mitchell', email: 'lily@example.com', phone: '+1-555-2030', subject: 'Consistency check' }
    ];

    // Get current max ticket ID
    const lastTicket = await Ticket.findOne().sort({ ticketId: -1 });
    let startNum = 220; // Starting from 2025-00220
    if (lastTicket && lastTicket.ticketId) {
      const lastNum = parseInt(lastTicket.ticketId.split('-')[1]);
      startNum = lastNum + 1;
    }

    const createdTickets = [];
    const now = new Date();

    for (let i = 0; i < ticketData.length; i++) {
      const data = ticketData[i];
      const ticketId = `2025-${String(startNum + i).padStart(5, '0')}`;
      
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
    console.log(`✓ Created 30 new tickets\n`);

    // Show statistics
    console.log('📊 New Tickets Statistics');
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

    // Get total count
    const totalTickets = await Ticket.countDocuments();
    console.log(`Total tickets in database: ${totalTickets}\n`);

    // Calculate average reply time for all tickets
    const allTicketsWithReply = await Ticket.find({ firstReplyAt: { $ne: null } });
    if (allTicketsWithReply.length > 0) {
      const totalReplyTime = allTicketsWithReply.reduce((sum, ticket) => {
        return sum + (ticket.firstReplyAt - ticket.createdAt);
      }, 0);
      const avgReplyTimeMs = totalReplyTime / allTicketsWithReply.length;
      const avgReplyTimeMinutes = Math.round(avgReplyTimeMs / (60 * 1000));
      const avgReplyTimeHours = (avgReplyTimeMinutes / 60).toFixed(1);
      
      console.log(`Overall Average Reply Time: ${avgReplyTimeHours}h (${avgReplyTimeMinutes}m)\n`);
    }

    console.log('═'.repeat(60));
    console.log('✅ ADDED 30 MORE TICKETS');
    console.log('═'.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addMoreTickets();
