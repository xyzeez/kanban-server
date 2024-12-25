const express = require('express');

// Controllers
const { protectRoute } = require('../controllers/authController');
const { createBoard, updateBoard } = require('../controllers/boardController');
const { createTask, updateTask } = require('../controllers/taskController');

// Router
const router = express.Router({ mergeParams: true });

// Protected routes
router.use(protectRoute);

// Endpoints
router.route('/').post(createBoard);

router.route('/:id').patch(updateBoard);

router.route('/:boardId/columns/:columnId/tasks').post(createTask);

router.route('/:boardId/columns/:columnId/tasks/:taskId').patch(updateTask);

module.exports = router;
