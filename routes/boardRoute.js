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

// Router
const router = express.Router({ mergeParams: true });

// Protected routes
router.use(protectRoute);

// Endpoints
router.route('/').get(getBoards).post(createBoard);

router.route('/:id').get(getBoard).patch(updateBoard).delete(deleteBoard);

router.route('/:id/columns').get(getColumns).post(addColumns);

module.exports = router;
