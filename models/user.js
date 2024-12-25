const { Schema, model } = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcryptjs');

// Utils
const AppError = require('../utils/appError');

// Helpers
function validateConfirmPassword(confirmPassword) {
  return this.password === confirmPassword;
}

// Schemas
const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required.'],
      trim: true,
      lowercase: true,
      unique: true,
      validate: [isEmail, 'Please provide a valid email address.']
    },
    password: {
      type: String,
      required: [true, 'Kindly provide a password'],
      minLength: [8, 'Password must contain at lease 8 characters'],
      select: false
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Kindly provide a password confirmation'],
      validate: [
        validateConfirmPassword,
        'Confirm Password must be equal to password.'
      ]
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    isActive: {
      type: Boolean,
      default: true,
      select: false
    }
  },
  {
    timestamps: true
  }
);

// Methods
userSchema.methods.validatePassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.validatePasswordChange = function (JWTInitiatedDate) {
  if (this.passwordChangedAt) {
    const passwordChangedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return passwordChangedTimestamp > JWTInitiatedDate;
  }

  return false;
};

// Middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;

  next();
});

userSchema.post('save', function (error, doc, next) {
  if (error.code === 11000 && error.keyValue.email) {
    return next(new AppError(`Email address is already in use.`, 409));
  }

  next(error);
});

// Model
const User = model('User', userSchema);

module.exports = User;
