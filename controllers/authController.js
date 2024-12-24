const jwt = require('jsonwebtoken');

// Utils
const catchAsyncError = require('../utils/catchAsyncError');

// Models
const User = require('../models/user');
const AppError = require('../utils/appError');

// Helpers
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY);
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);

  const cookieOptions = {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict'
  };

  res.cookie('authToken', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

// Handlers
exports.register = catchAsyncError(async (req, res, next) => {
  const { email, password, passwordConfirm } = req.body;

  const user = await User.create({ email, password, passwordConfirm });

  createSendToken(user, 201, res);
});

exports.login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.validatePassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('authToken', undefined, {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({ status: 'success' });
};
