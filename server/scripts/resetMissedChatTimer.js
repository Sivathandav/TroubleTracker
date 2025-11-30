require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Customization = require('../models/Customization');

async function resetTimer() {
  try {
    await connectDB();
    
    await Customization.updateOne(
      {},
      {
        $set: {
          missedChatTimer: {
            hours: 0,
            minutes: 5,
            seconds: 0
          }
        }
      },
      { upsert: true }
    );
    
    console.log('✓ Missed Chat Timer reset to 5 minutes');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetTimer();
