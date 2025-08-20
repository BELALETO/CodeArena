// models/problemModel.js
const mongoose = require('mongoose');
const slugify = require('slugify');

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
    slug: {
      type: String,
      unique: true,
      trim: true
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Easy'
    },
    tags: [String], // e.g., ['arrays', 'recursion']
    points: {
      type: Number,
      required: [true, 'A problem must have points'],
      default: 100 // Default points for the problem
    },
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TestCase',
        default: []
      }
    ]
  },
  {
    timestamps: true // createdAt and updatedAt fields
  }
);

// Create slug from the title before saving
problemSchema.pre('save', function (next) {
  this.slug = slugify(this.title, { lower: true, strict: true });
  next();
});

const Problem = mongoose.model('Problem', problemSchema);
module.exports = Problem;
