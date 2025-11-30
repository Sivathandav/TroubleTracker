require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

async function listAllUsers() {
  try {
    await connectDB();

    const users = await User.find({});
    console.log('\n📋 All Users in Database:\n');
    users.forEach((u, index) => {
      console.log(`${index + 1}. ${u.email}`);
      console.log(`   Name: ${u.name}`);
      console.log(`   Role: ${u.role}\n`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

listAllUsers();
