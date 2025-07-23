const Problem = require('../models/problemModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const getProblems = catchAsync(async (req, res, next) => {
  const problems = await Problem.find();
  res.status(200).json({
    status: 'success',
    results: problems.length,
    data: {
      problems
    }
  });
});

const getProblem = catchAsync(async (req, res, next) => {
  const problem = await Problem.findById(req.params.id);
  if (!problem) {
    return next(new AppError(404, 'No problem found with that ID'));
  }
  res.status(200).json({
    status: 'success',
    data: {
      problem
    }
  });
});

const createProblem = catchAsync(async (req, res, next) => {
  const newProblem = await Problem.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      problem: newProblem
    }
  });
});

const updateProblem = catchAsync(async (req, res, next) => {
  const problem = await Problem.findByIdAndUpdate(req.params.id);
  if (!problem) {
    return next(new AppError(404, 'No problem found with that ID'));
  }
  const updatedProblem = await Problem.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );
  res.status(200).json({
    status: 'success',
    data: {
      problem: updatedProblem
    }
  });
});

const deleteProblem = catchAsync(async (req, res, next) => {
  const problem = await Problem.findByIdAndDelete(req.params.id);
  if (!problem) {
    return next(new AppError(404, 'No problem found with that ID'));
  }
  res.status(204).json({
    status: 'success',
    data: null
  });
});

module.exports = {
  getProblems,
  getProblem,
  createProblem,
  updateProblem,
  deleteProblem
};
