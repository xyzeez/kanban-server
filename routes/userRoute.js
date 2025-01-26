const express = require('express');

// Controllers
const { getMe } = require('../controllers/userController');
const { protectRoute } = require('../controllers/authController');

// Router
const router = express.Router();

// Protected routes
router.use(protectRoute);

// Endpoints
router.route('/me').get(getMe);

module.exports = router;
