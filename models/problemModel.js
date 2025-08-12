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

// Create slug from the title before saving
problemSchema.pre('save', function (next) {
  this.slug = slugify(this.title, { lower: true, strict: true });
  next();
});

const Problem = mongoose.model('Problem', problemSchema);
module.exports = Problem;
