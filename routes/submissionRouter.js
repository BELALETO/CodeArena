// routes/submissionRouter.js
const express = require('express');
const submissionController = require('../controllers/submissionController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes
router.use(authController.protect);

router.post('/:problemId/cpp', submissionController.compileAndRunCpp);

router.get('/my-submissions', submissionController.getUserSubmissions);

router.get('/leaderboard', submissionController.getLeaderboard);

module.exports = router;
