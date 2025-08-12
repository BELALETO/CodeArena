const path = require('path');
const dotenv = require('dotenv').config({
  path: path.resolve(__dirname, '../config.env') // Updated to config.env
});
const fs = require('node:fs/promises');
const mongoose = require('mongoose');
const Problem = require('../models/problemModel');

const uri = process.env.URI;
const password = process.env.PASSWORD;

// Validate environment variables
if (!uri || !password) {
  console.error('❌ Missing MongoDB credentials in config.env');
  process.exit(1);
}

(async () => {
  try {
    // 1. Connect to MongoDB
    const connectionString = uri.replace('<PASSWORD>', password);
    await mongoose.connect(connectionString);
    console.log('✅ Connected to MongoDB');

    // 2. Handle --import or --delete
    if (process.argv[2] === '--import') {
      const data = JSON.parse(
        await fs.readFile(path.resolve(__dirname, './data.json'))
      );
      for (const problem of data) {
        await Problem.create(problem);
      }
      console.log('✅ Data imported successfully');
    } else if (process.argv[2] === '--delete') {
      await Problem.deleteMany();
      console.log('✅ Data deleted successfully');
    }

    // 3. Disconnect
    await mongoose.disconnect();
    console.log('🛑 Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
})();
