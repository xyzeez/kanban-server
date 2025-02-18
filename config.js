exports.DB =
  process.env.NODE_ENV === 'production'
    ? process.env.LIVE_DB
    : process.env.LOCAL_DB;

exports.PORT = 3000;

exports.API_BASE_URL = '/api/v1';

exports.ORIGIN_URL =
  process.env.NODE_ENV === 'production'
    ? process.env.LIVE_FRONTEND_URL
    : process.env.LOCAL_FRONTEND_URL;

exports.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

exports.COOKIE_EXPIRY_DAYS =
  (parseInt(process.env.COOKIE_MAX_AGE_DAYS) || 1) * 24 * 60 * 60 * 1000;

exports.RATE_LIMIT = {
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  windowMs:
    (parseInt(process.env.RATE_LIMIT_WINDOW_HOURS) || 1) * 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again later!'
};
