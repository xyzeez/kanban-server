const { Schema, model } = require('mongoose');
const { isEmail } = require('validator');

// Utils
const AppError = require('../utils/appError');

// Schemas
const userSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'User name is required.'],
      minlength: [2, 'User name must be at least 2 characters long.'],
      maxlength: [50, 'User name cannot exceed 50 characters.']
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      trim: true,
      lowercase: true,
      unique: true,
      validate: [isEmail, 'Please provide a valid email address.']
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Schema Index
userSchema.index({ email: 1 });

// Middleware
userSchema.post('save', function (error, doc, next) {
  if (error.code === 11000 && error.keyValue.email) {
    return next(new AppError(`Email address is already in use.`, 409));
  }

  next(error);
});

// Model
const User = model('User', userSchema);

module.exports = User;
