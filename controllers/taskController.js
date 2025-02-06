// Models
const Task = require('../models/task');

// Utils
const AppError = require('../utils/appError');
const catchAsyncError = require('../utils/catchAsyncError');

// Handlers
exports.getTasks = catchAsyncError(async (req, res, next) => {
  const { columnId } = req.query;

  const tasks = await Task.find({ columnId });

  res.status(200).json({
    status: 'success',
    data: { tasks }
  });
});

exports.getTask = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const task = await Task.findById(id);

  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { task }
  });
});

exports.createTask = catchAsyncError(async (req, res, next) => {
  const { title, description, subtasks } = req.body;
  const { columnId, boardId } = req.query;

  const task = await Task.create({
    title,
    description,
    subtasks,
    columnId,
    boardId
  });

  res.status(201).json({
    status: 'success',
    data: { task }
  });
});

exports.updateTask = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { title, description, subtasks, columnId, boardId } = req.body;

  const task = await Task.findById(id);

  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  if (boardId !== undefined && boardId !== task.boardId.toString()) {
    return next(new AppError('Cannot change task board after creation', 400));
  }

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (subtasks !== undefined) task.subtasks = subtasks;
  if (columnId !== undefined) task.columnId = columnId;

  const updatedTask = await task.save();

  res.status(200).json({
    status: 'success',
    data: { task: updatedTask }
  });
});

exports.deleteTask = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const task = await Task.findByIdAndDelete(id);

  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  res.status(204).json({ status: 'success', data: null });
});
