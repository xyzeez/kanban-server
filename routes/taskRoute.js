const express = require('express');

// Controllers
const { protectRoute } = require('../controllers/authController');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  updateSubtasks,
  updateColumn,
  updateTaskPosition
} = require('../controllers/taskController');

const router = express.Router({ mergeParams: true });

// Protected routes
router.use(protectRoute);

// Endpoints
router.route('/').get(getTasks).post(createTask);

router.route('/:id').get(getTask).patch(updateTask).delete(deleteTask);

router.route('/:id/subtasks').patch(updateSubtasks);

router.route('/:id/column').patch(updateColumn);

router.route('/:id/position').patch(updateTaskPosition);

module.exports = router;
