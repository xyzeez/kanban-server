const express = require('express');

// Controllers
const { protectRoute } = require('../controllers/authController');
const {
  createBoard,
  updateBoard,
  getBoards,
  deleteBoard,
  getBoard,
  getColumns,
  addColumns
} = require('../controllers/boardController');
const { createTask, updateTask } = require('../controllers/taskController');

// Router
const router = express.Router({ mergeParams: true });

// Protected routes
router.use(protectRoute);

// Endpoints
router.route('/').post(createBoard).get(getBoards);

router.route('/:id').get(getBoard).patch(updateBoard).delete(deleteBoard);

router.route('/:id/columns').get(getColumns).post(addColumns);

router.route('/:boardId/columns/:columnId/tasks').post(createTask);

router.route('/:boardId/columns/:columnId/tasks/:taskId').patch(updateTask);

module.exports = router;
