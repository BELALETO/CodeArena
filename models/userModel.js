const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false // Do not return password in queries by default
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        // This only works on CREATE and SAVE
        validator: function (el) {
          return el === this.password; // Check if password and passwordConfirm match
        }
      }
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user' // Default role is user
    },
    passwordResetExpiry: Date
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
    toJSON: { virtuals: true }, // Include virtuals in JSON output
    toObject: { virtuals: true } // Include virtuals in object output
  }
);

userSchema.pre('save', async function (next) {
  // Hash the password before saving to the database
  if (this.isModified('password') || this.isNew) {
    this.password = await bcrypt.hash(this.password, 12); // Hash the password with a salt round of 12
  }
  this.passwordConfirm = undefined; // Remove passwordConfirm field after hashing

  next();
});

userSchema.methods.correctPassword = function (
  candidatePassword,
  userPassword
) {
  // Compare the candidate password with the stored hashed password
  return bcrypt.compareSync(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  // Check if the password was changed after the JWT was issued
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimeStamp < changedTimeStamp;
  }
  return false; // If no passwordChangedAt field, return false
};

userSchema.methods.generateToken = async function () {
  const token = await bcrypt.hash(this.email, 12);
  this.passwordResetExpiry = Date.now() + 10 * 60 * 1000;
  console.log('token :>> ', token);
  return token;
};

// Create a model from the schema
const User = mongoose.model('User', userSchema);
// Export the model
module.exports = User;
