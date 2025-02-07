const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const { isJWT } = require('validator');

// Configs
const { COOKIE_EXPIRY_DAYS, JWT_EXPIRES_IN } = require('../config');

// Models
const User = require('../models/user');

// Utils
const catchAsyncError = require('../utils/catchAsyncError');
const AppError = require('../utils/appError');

// Helpers
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res, remember = false) => {
  const token = signToken(user.id);

  const cookieOptions = {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: remember ? COOKIE_EXPIRY_DAYS : 24 * 60 * 60 * 1000
  };

  res.cookie('authToken', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    data: { token, user }
  });
};

// Middlewares
exports.protectRoute = catchAsyncError(async (req, res, next) => {
  const { authorization } = req.headers;

  if (
    (!authorization || !authorization.startsWith('Bearer')) &&
    !req.cookies?.authToken
  ) {
    return next(new AppError('Authentication failed. Please login.', 401));
  }

  const token = authorization?.split(' ')[1] || req.cookies?.authToken;

  if (!token || !isJWT(token)) {
    return next(new AppError('Authentication failed. Please login.', 401));
  }

  const { id, iat } = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_KEY
  );

  const user = await User.findById(id).select('+isActive');

  if (!user || !user.isActive) {
    return next(
      new AppError('User account is inactive or no longer exists.', 401)
    );
  }

  if (user.validatePasswordChange(iat)) {
    return next(
      new AppError('Password recently changed. Please login again.', 401)
    );
  }

  req.user = user;

  next();
});

// Handlers
exports.register = catchAsyncError(async (req, res, next) => {
  const { email, password, passwordConfirm } = req.body;

  const user = await User.create({ email, password, passwordConfirm });

  createSendToken(user, 201, res);
});

exports.login = catchAsyncError(async (req, res, next) => {
  const { email, password, remember } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.validatePassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  createSendToken(user, 200, res, remember);
});

exports.logout = (req, res) => {
  res.cookie('authToken', undefined, {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({ status: 'success', data: null });
};

exports.getCurrentAuthUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(201).json({
    status: 'success',
    data: { user }
  });
});
