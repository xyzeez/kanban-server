const express = require('express');

// Controllers
const {
  register,
  login,
  logout,
  protectRoute,
  getCurrentAuthUser
} = require('../controllers/authController');

// Router
const router = express.Router();

router.route('/register').post(register);

router.route('/login').post(login);

router.route('/logout').post(logout);

// Protected routes
router.use(protectRoute);

router.route('/me').get(getCurrentAuthUser);

module.exports = router;
