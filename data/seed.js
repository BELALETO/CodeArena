const path = require('path');
const dotenv = require('dotenv').config({
  path: path.resolve(__dirname, '../config.env')
});
const fs = require('node:fs/promises');
const mongoose = require('mongoose');
const Problem = require('../models/problemModel');
const User = require('../models/userModel');
const TestCase = require('../models/testCaseModel');

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
      // Delete existing data first
      await Problem.deleteMany();
      await User.deleteMany();
      await TestCase.deleteMany();
      console.log('✅ Cleared existing data');

      // Import users
      const usersData = JSON.parse(
        await fs.readFile(path.resolve(__dirname, './users.json'))
      );
      const users = await User.create(usersData);
      console.log(`✅ Created ${users.length} users`);

      // Import problems
      const problemsData = JSON.parse(
        await fs.readFile(path.resolve(__dirname, './problems.json'))
      );
      const problems = await Problem.create(problemsData);
      console.log(`✅ Created ${problems.length} problems`);

      // Import test cases and link them to problems
      const testCasesData = JSON.parse(
        await fs.readFile(path.resolve(__dirname, './test_cases.json'))
      );

      // Create a mapping of problem titles to their IDs
      const problemIdMap = {};
      problems.forEach((problem) => {
        problemIdMap[problem.title] = problem._id;
      });

      // Replace problem titles with actual ObjectIds in test cases
      const testCasesWithIds = testCasesData.map((testCase) => {
        const problemId = problemIdMap[testCase.problem];
        if (!problemId) {
          throw new Error(`Problem not found: ${testCase.problem}`);
        }
        return {
          ...testCase,
          problem: problemId
        };
      });

      const testCases = await TestCase.create(testCasesWithIds);
      console.log(`✅ Created ${testCases.length} test cases`);

      // Update problems with test case references
      for (const problem of problems) {
        const problemTestCases = testCases.filter(
          (tc) => tc.problem.toString() === problem._id.toString()
        );
        problem.testCases = problemTestCases.map((tc) => tc._id);
        await problem.save();
      }
      console.log('✅ Updated problems with test case references');

      console.log('✅ Data imported successfully');
    } else if (process.argv[2] === '--delete') {
      await Problem.deleteMany();
      await User.deleteMany();
      await TestCase.deleteMany();
      console.log('✅ Data deleted successfully');
    } else {
      console.log('❌ Please specify --import or --delete flag');
    }

    // 3. Disconnect
    await mongoose.disconnect();
    console.log('🛑 Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
})();
