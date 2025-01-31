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
  const { title, description, subtasks } = req.body;

  const { taskId } = req.params;

  const task = await Task.findById(taskId);

  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  task.title = title;
  task.description = description;
  task.subtasks = subtasks;

  const updatedTask = await task.save();

  res.status(200).json({
    status: 'success',
    data: { task: updatedTask }
  });
});
