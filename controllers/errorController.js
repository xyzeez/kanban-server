// Utils
const AppError = require('../utils/appError');

// Helpers
const sendErrorOnDev = (error, res) => {
  const { statusCode, status, message, stack } = error;

  res.status(statusCode || 500).json({
    status: status || 'error',
    message,
    stack,
    error
  });
};

const sendErrorOnProd = (error, res) => {
  const statusCode = error.isOperational ? error.statusCode : 500;
  const status = error.isOperational ? error.status : 'error';
  const message = error.isOperational ? error.message : 'Something went wrong.';

  res.status(statusCode).json({ status, message });
};

// Handlers
exports.noEndpointHandler = (req, res, next) => {
  next(new AppError(`${req.originalUrl} is not a valid endpoint.`, 404));
};

exports.globalErrorHandler = (error, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    sendErrorOnDev(error, res);
  } else if (process.env.NODE_ENV === 'production') {
    sendErrorOnProd(error, res);
  }
};
