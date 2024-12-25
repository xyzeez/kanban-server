// Models
const Task = require('../models/task');

// Utils
const AppError = require('../utils/appError');
const catchAsyncError = require('../utils/catchAsyncError');

// Handlers
exports.createTask = catchAsyncError(async (req, res, next) => {
  const { title, description, subtasks } = req.body;

  const subtasksData =
    subtasks && subtasks.length > 0
      ? subtasks.map((task) => ({ title: task }))
      : undefined;

  const task = await Task.create({
    title,
    description,
    subtasks: subtasksData,
    boardId: req.params.boardId,
    columnId: req.params.columnId
  });

  res.status(201).json({
    status: 'success',
    data: { task }
  });
});

exports.updateTask = catchAsyncError(async (req, res, next) => {
  const { title, description, subtasks } = req.body;

  const { boardId, columnId, taskId } = req.params;

  const task = await Task.findById(taskId);

  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  if (!task.boardId === boardId) {
    return next(
      new AppError('Task does not belong to the specified board.', 400)
    );
  }

  if (!task.columnId === columnId) {
    return next(
      new AppError('Task does not belong to the specified column.', 400)
    );
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
