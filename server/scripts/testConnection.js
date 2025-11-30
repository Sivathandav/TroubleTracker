require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...\n');
    console.log('MONGODB_URI:', process.env.MONGODB_URI);
    console.log('\nAttempting to connect...\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ Successfully connected to MongoDB!');
    console.log('Database:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    
    await mongoose.disconnect();
    console.log('\n✅ Connection test passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
