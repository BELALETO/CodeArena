// models/problemModel.js
const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A problem must have a title'],
      unique: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'A problem must have a description']
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Easy'
    },
    tags: [String], // e.g., ['arrays', 'recursion']

    sampleInput: {
      type: String,
      required: true
    },
    sampleOutput: {
      type: String,
      required: true
    },

    testCases: [
      {
        input: {
          type: String,
          required: true
        },
        output: {
          type: String,
          required: true
        },
        hidden: {
          type: Boolean,
          default: true // visible only to system
        }
      }
    ]
  },
  {
    timestamps: true // createdAt and updatedAt fields
  }
);

const Problem = mongoose.model('Problem', problemSchema);
module.exports = Problem;
