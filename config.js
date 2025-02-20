exports.DB = process.env.DB;

exports.PORT = 3000;

exports.API_BASE_URL = '/api/v1';

exports.ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS.split(',');

exports.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

exports.COOKIE_NAME = 'authToken';

exports.COOKIE_EXPIRY_DAYS =
  (parseInt(process.env.COOKIE_MAX_AGE_DAYS) || 1) * 24 * 60 * 60 * 1000;

exports.COOKIE_OPTIONS = {
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
};

exports.RATE_LIMIT = {
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  windowMs:
    (parseInt(process.env.RATE_LIMIT_WINDOW_HOURS) || 1) * 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again later!'
};
