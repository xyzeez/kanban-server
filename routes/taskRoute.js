const express = require('express');

// Controllers
const { protectRoute } = require('../controllers/authController');
const { getTasks, createTask } = require('../controllers/taskController');

const router = express.Router({ mergeParams: true });

// Protected routes
router.use(protectRoute);

// Endpoints
router.route('/').get(getTasks).post(createTask);

module.exports = router;
