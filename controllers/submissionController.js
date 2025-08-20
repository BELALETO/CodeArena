// controllers/submissionController.js
const { exec } = require('child_process');
const fs = require('fs-extra');
const tmp = require('tmp-promise');
const path = require('path');
const Problem = require('../models/problemModel');
const TestCase = require('../models/testCaseModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Helper function to update user rank based on score
const updateUserRank = (score) => {
  if (score >= 2000) {
    return 'Platinum';
  }
  if (score >= 1000) {
    return 'Gold';
  }
  if (score >= 500) {
    return 'Silver';
  }
  return 'Bronze';
};

const compileAndRunCpp = catchAsync(async (req, res, next) => {
  const { code } = req.body;
  const { problemId } = req.params;
  const userId = req.user._id;

  if (!code) {
    return next(new AppError(400, 'Code is required'));
  }

  // Find the problem and its test cases
  const problem = await Problem.findById(problemId).populate('testCases');
  if (!problem) {
    return next(new AppError(404, 'Problem not found'));
  }

  if (!problem.testCases || problem.testCases.length === 0) {
    return next(new AppError(404, 'No test cases found for this problem'));
  }

  // Check if user already solved this problem
  const user = await User.findById(userId);
  if (user.solvedProblems.includes(problemId)) {
    return next(new AppError(400, 'You have already solved this problem'));
  }

  let tempDir;
  let sourceFile;
  let executableFile;

  try {
    // Create temporary directory
    tempDir = await tmp.dir({ unsafeCleanup: true });

    // Create source file
    sourceFile = path.join(tempDir.path, 'solution.cpp');
    executableFile = path.join(tempDir.path, 'solution');

    // Write code to file
    await fs.writeFile(sourceFile, code);

    // Compile C++ code
    const compileResult = await new Promise((resolve, reject) => {
      exec(
        `g++ -std=c++17 ${sourceFile} -o ${executableFile}`,
        (error, stdout, stderr) => {
          if (error) {
            reject(new AppError(400, `Compilation error: ${stderr}`));
          } else {
            resolve({ stdout, stderr });
          }
        }
      );
    });

    // Run against each test case
    const results = [];
    let allTestCasesPassed = true;

    for (const testCase of problem.testCases) {
      if (!testCase.isPublic) {
        continue;
      } // Skip private test cases

      try {
        // Create input file
        const inputFile = path.join(tempDir.path, 'input.txt');
        await fs.writeFile(inputFile, testCase.input);

        // Run the compiled program with timeout (5 seconds)
        const runResult = await new Promise((resolve, reject) => {
          const child = exec(
            `${executableFile} < ${inputFile}`,
            { timeout: 5000 },
            (error, stdout, stderr) => {
              if (error) {
                if (error.killed && error.signal === 'SIGTERM') {
                  reject(new AppError(400, 'Time limit exceeded'));
                } else {
                  reject(new AppError(400, `Runtime error: ${stderr}`));
                }
              } else {
                resolve({ stdout: stdout.trim(), stderr });
              }
            }
          );
        });

        // Compare output
        const expectedOutput = testCase.output.trim();
        const actualOutput = runResult.stdout.trim();
        const isCorrect = expectedOutput === actualOutput;

        if (!isCorrect) {
          allTestCasesPassed = false;
        }

        results.push({
          testCaseId: testCase._id,
          input: testCase.input,
          expectedOutput,
          actualOutput,
          isCorrect,
          error: runResult.stderr || null
        });
      } catch (error) {
        allTestCasesPassed = false;
        results.push({
          testCaseId: testCase._id,
          input: testCase.input,
          expectedOutput: testCase.output.trim(),
          actualOutput: null,
          isCorrect: false,
          error: error.message
        });
      }
    }

    // Calculate score and update user if all test cases passed
    let scoreEarned = 0;
    let userUpdated = false;

    if (allTestCasesPassed) {
      scoreEarned = problem.points;

      // Update user's score, solved problems, and rank
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $inc: { score: scoreEarned },
          $addToSet: { solvedProblems: problemId },
          $set: {
            rank: updateUserRank(user.score + scoreEarned),
            updatedAt: new Date()
          }
        },
        { new: true, runValidators: true }
      );

      userUpdated = true;
    }

    const passedCases = results.filter((result) => result.isCorrect).length;
    const totalCases = results.length;

    res.status(200).json({
      status: 'success',
      data: {
        problem: {
          id: problem._id,
          title: problem.title,
          difficulty: problem.difficulty,
          points: problem.points
        },
        totalTestCases: totalCases,
        passedTestCases: passedCases,
        allTestCasesPassed,
        scoreEarned,
        userUpdated,
        results,
        summary: {
          passed: passedCases,
          failed: totalCases - passedCases,
          total: totalCases,
          percentage:
            totalCases > 0 ? Math.round((passedCases / totalCases) * 100) : 0
        }
      }
    });
  } catch (error) {
    return next(error);
  } finally {
    // Clean up temporary files
    if (tempDir) {
      await tempDir.cleanup();
    }
  }
});

// Get user submission history
const getUserSubmissions = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const user = await User.findById(userId)
    .populate('solvedProblems', 'title difficulty points')
    .select('solvedProblems score rank');

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        score: user.score,
        rank: user.rank,
        totalSolved: user.solvedProblems.length
      },
      solvedProblems: user.solvedProblems
    }
  });
});

// Get leaderboard
const getLeaderboard = catchAsync(async (req, res, next) => {
  const users = await User.find({ active: true })
    .select('firstName lastName score rank solvedProblems')
    .populate('solvedProblems', 'title')
    .sort({ score: -1, updatedAt: 1 })
    .limit(20);

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      leaderboard: users.map((user, index) => ({
        rank: index + 1,
        name: `${user.firstName} ${user.lastName}`,
        score: user.score,
        rankTitle: user.rank,
        problemsSolved: user.solvedProblems.length
      }))
    }
  });
});

module.exports = {
  compileAndRunCpp,
  getUserSubmissions,
  getLeaderboard
};
