// Models
const User = require('../models/user');

// Utils
const catchAsyncError = require('../utils/catchAsyncError');

exports.createUser = catchAsyncError(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { user }
  });
});
