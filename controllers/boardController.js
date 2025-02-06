// Models
const Board = require('../models/board');
const Task = require('../models/task');
const mongoose = require('mongoose');

// Utils
const catchAsyncError = require('../utils/catchAsyncError');
const AppError = require('../utils/appError');

// Handlers
exports.getBoards = catchAsyncError(async (req, res, next) => {
  const boards = await Board.find({ ownerId: req.user.id }).select('id name');

  res.status(200).json({
    status: 'success',
    data: { boards }
  });
});

exports.getBoard = catchAsyncError(async (req, res, next) => {
  const board = await Board.findById(req.params.id).select('id name columns');

  res.status(200).json({
    status: 'success',
    data: { board }
  });
});

exports.getColumns = catchAsyncError(async (req, res, next) => {
  const board = await Board.findById(req.params.id).select('columns');

  res.status(200).json({
    status: 'success',
    data: { columns: board.columns }
  });
});

exports.createBoard = catchAsyncError(async (req, res, next) => {
  const { name, columns } = req.body;

  const columnsData = columns && columns.length > 0 ? columns : undefined;

  const board = await Board.create({
    name,
    columns: columnsData,
    ownerId: req.user.id
  });

  res.status(201).json({
    status: 'success',
    data: { board }
  });
});

exports.updateBoard = catchAsyncError(async (req, res, next) => {
  const { name, columns } = req.body;
  const boardId = req.params.id;

  const board = await Board.findById(boardId);

  if (!board) {
    return next(new AppError('Board not found.', 404));
  }

  if (name) board.name = name;

  if (columns) {
    const existingColumnIds = board.columns.map((col) => col._id.toString());

    const updatedExistingColumnIds = columns
      .filter((col) => col._id)
      .map((col) => col._id.toString());

    const droppedColumnIds = existingColumnIds.filter(
      (id) => !updatedExistingColumnIds.includes(id)
    );

    if (droppedColumnIds.length > 0) {
      await Task.deleteMany({
        boardId: board.id,
        columnId: { $in: droppedColumnIds }
      });
    }

    board.columns = columns;
  }

  const updatedBoard = await board.save();

  res.status(200).json({
    status: 'success',
    data: { board: updatedBoard }
  });
});

exports.addColumns = catchAsyncError(async (req, res, next) => {
  const { columns } = req.body;
  const boardId = req.params.id;

  const board = await Board.findById(boardId);

  if (!board) {
    return next(new AppError('Board not found.', 404));
  }

  if (!columns) {
    return next(new AppError('Column data is required.', 400));
  }

  board.columns.push(...columns);

  const updatedBoard = await board.save();

  res.status(200).json({
    status: 'success',
    data: { board: updatedBoard }
  });
});

exports.deleteBoard = catchAsyncError(async (req, res, next) => {
  const board = await Board.findByIdAndDelete(req.params.id);

  if (!board) {
    return next(new AppError('Board not found.', 404));
  }

  await Task.deleteMany({ boardId: board.id });

  res.status(204).json({
    status: 'success',
    data: null
  });
});
