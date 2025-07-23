const router = require('express').Router();
const problemController = require('../controllers/problemController');
const authController = require('../controllers/authController');

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    problemController.getProblems
  )
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    problemController.createProblem
  );

router
  .route('/:id')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    problemController.getProblem
  )
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    problemController.updateProblem
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    problemController.deleteProblem
  );

module.exports = router;
