// Model
const User = require('../models/user');

// Utils
const catchAsyncError = require('./catchAsyncError');

const validateAssignedUser = catchAsyncError(async (userId) => {
  return await User.exists({ _id: userId });
});

module.exports = validateAssignedUser;
