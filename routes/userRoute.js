const express = require('express');

// Controllers
const { protectRoute } = require('../controllers/authController');

// Router
const router = express.Router();

// Protected routes
router.use(protectRoute);

module.exports = router;
