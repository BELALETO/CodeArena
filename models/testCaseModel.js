const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema(
  {
    input: {
      type: String,
      required: [true, 'Test case input is required']
    },
    output: {
      type: String,
      required: [true, 'Test case output is required']
    },
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: [true, 'Test case must belong to a problem']
    },
    isPublic: {
      type: Boolean,
      default: true // Test cases are public by default
    }
  },
  {
    timestamps: true // createdAt and updatedAt fields
  }
);

const TestCase = mongoose.model('TestCase', testCaseSchema);
module.exports = TestCase;
