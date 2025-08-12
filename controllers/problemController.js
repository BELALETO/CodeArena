const Problem = require('../models/problemModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const getProblems = catchAsync(async (req, res, next) => {
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach((el) => delete queryObj[el]);

  let query = Problem.find(queryObj);
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  } else {
    query = query.select('-__v');
  }
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page - 1) * limit;
  query = query.skip(skip).limit(limit);
  if (req.query.page) {
    const numProblems = await Problem.countDocuments(queryObj);
    if (skip >= numProblems) {
      return next(new AppError(404, 'This page does not exist'));
    }
  }
  const problems = await query;
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
