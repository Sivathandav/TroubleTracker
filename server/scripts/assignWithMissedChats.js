require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Customization = require('../models/Customization');

async function assignWithMissedChats() {
  try {
    await connectDB();
    console.log('Connected to MongoDB\n');

    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║      ASSIGNING TICKETS WITH MISSED CHATS DISTRIBUTION         ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    // Get all team members (excluding admin)
    const members = await User.find({ role: { $ne: 'admin' } });
    
    if (members.length === 0) {
      console.log('❌ No team members found');
      process.exit(1);
    }

    console.log(`📋 Found ${members.length} team members:`);
    members.forEach((member, idx) => {
      console.log(`   ${idx + 1}. ${member.name} (${member.email})`);
    });
    console.log();

    // Get customization settings for threshold
    const settings = await Customization.getSettings();
    const thresholdMinutes = settings.missedChatThreshold || 5;
    const thresholdMs = thresholdMinutes * 60 * 1000;

    console.log(`⏱️  Missed chat threshold: ${thresholdMinutes} minutes\n`);

    // Get all tickets
    const allTickets = await Ticket.find({});
    
    console.log(`📝 Found ${allTickets.length} total tickets\n`);

    // Calculate date 10 weeks ago
    const tenWeeksAgo = new Date();
    tenWeeksAgo.setDate(tenWeeksAgo.getDate() - 70);

    // Assign tickets and create missed chats
    let assignmentCount = 0;
    let missedChatCount = 0;
    const assignmentMap = {};
    const missedChatsByWeek = {};

    for (let i = 0; i < allTickets.length; i++) {
      const ticket = allTickets[i];
      
      // Pick a random member
      const randomMember = members[Math.floor(Math.random() * members.length)];
      ticket.assignedTo = randomMember._id;
      
      // Track assignments
      if (!assignmentMap[randomMember.name]) {
        assignmentMap[randomMember.name] = 0;
      }
      assignmentMap[randomMember.name]++;

      // Create missed chats for some tickets starting from week 1
      // About 30% of tickets will be missed chats
      const shouldBeMissed = Math.random() < 0.3;
      
      if (shouldBeMissed && ticket.status === 'unresolved' && !ticket.firstReplyAt) {
        // Pick a random week (1-10, but favor earlier weeks)
        const weekNum = Math.floor(Math.random() * 7) + 1; // Weeks 1-7 mostly
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (weekNum + 1) * 7);
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() - weekNum * 7);

        // Create ticket in that week
        const ticketDate = new Date(weekStart.getTime() + Math.random() * (weekEnd - weekStart));
        ticket.createdAt = ticketDate;
        
        // Make sure it's old enough to be considered missed (older than threshold)
        const now = new Date();
        const timeSinceCreation = now - ticketDate;
        
        if (timeSinceCreation > thresholdMs) {
          missedChatCount++;
          if (!missedChatsByWeek[weekNum]) {
            missedChatsByWeek[weekNum] = 0;
          }
          missedChatsByWeek[weekNum]++;
        }
      }

      await ticket.save();
      assignmentCount++;
    }

    console.log('✓ Assigned all tickets\n');

    // Show assignment statistics
    console.log('📊 Assignment Statistics');
    console.log('─'.repeat(60));
    
    Object.entries(assignmentMap).forEach(([name, count]) => {
      console.log(`${name}: ${count} tickets`);
    });

    console.log('\n📊 Missed Chats by Week');
    console.log('─'.repeat(60));
    
    if (Object.keys(missedChatsByWeek).length === 0) {
      console.log('No missed chats created');
    } else {
      Object.entries(missedChatsByWeek)
        .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
        .forEach(([week, count]) => {
          console.log(`Week ${week}: ${count} missed chats`);
        });
    }

    console.log('\n' + '═'.repeat(60));
    console.log(`✅ ASSIGNED ${assignmentCount} TICKETS TO ${members.length} MEMBERS`);
    console.log(`✅ CREATED ${missedChatCount} MISSED CHATS`);
    console.log('═'.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

assignWithMissedChats();
