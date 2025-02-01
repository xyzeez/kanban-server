const express = require('express');

// Controllers
const { protectRoute } = require('../controllers/authController');
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

const router = express.Router({ mergeParams: true });

// Protected routes
router.use(protectRoute);

// Endpoints
router.route('/').get(getTasks).post(createTask);

router.route('/:id').patch(updateTask).delete(deleteTask);

module.exports = router;
