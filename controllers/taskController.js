// Models
const Task = require('../models/task');

// Utils
const AppError = require('../utils/appError');
const catchAsyncError = require('../utils/catchAsyncError');

// Handlers
exports.getTasks = catchAsyncError(async (req, res, next) => {
  const { columnId } = req.query;

  const tasks = await Task.find({ columnId }).sort({ position: 1 });

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

  // Get the highest position in the column
  const highestPositionTask = await Task.findOne({ columnId }).sort({
    position: -1
  });
  const position = highestPositionTask ? highestPositionTask.position + 1 : 0;

  const task = await Task.create({
    title,
    description,
    subtasks,
    columnId,
    boardId,
    position
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

exports.updateSubtasks = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { subtasks } = req.body;

  const task = await Task.findById(id);

  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  task.subtasks = subtasks;
  const updatedTask = await task.save();

  res.status(200).json({
    status: 'success',
    data: { task: updatedTask }
  });
});

exports.updateColumn = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { columnId } = req.body;

  const task = await Task.findById(id);

  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  task.columnId = columnId;
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

exports.updateTaskPosition = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { position, columnId: newColumnId } = req.body;

  const task = await Task.findById(id);
  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  const oldColumnId = task.columnId;
  const oldPosition = task.position;

  // If moving to a new column
  if (newColumnId && newColumnId !== oldColumnId.toString()) {
    // Update positions in the old column
    await Task.updateMany(
      {
        columnId: oldColumnId,
        position: { $gt: oldPosition }
      },
      { $inc: { position: -1 } }
    );

    // Get the highest position in the new column
    const highestPositionTask = await Task.findOne({
      columnId: newColumnId
    }).sort({ position: -1 });
    const newPosition =
      position ?? (highestPositionTask ? highestPositionTask.position + 1 : 0);

    // Update the task
    task.columnId = newColumnId;
    task.position = newPosition;

    // Update positions in the new column if position is specified
    if (position !== undefined) {
      await Task.updateMany(
        {
          columnId: newColumnId,
          position: { $gte: newPosition }
        },
        { $inc: { position: 1 } }
      );
    }
  }
  // If reordering within the same column
  else if (position !== undefined && position !== oldPosition) {
    const increment = position > oldPosition ? -1 : 1;
    const range =
      position > oldPosition
        ? { $gt: oldPosition, $lte: position }
        : { $gte: position, $lt: oldPosition };

    await Task.updateMany(
      {
        columnId: oldColumnId,
        position: range
      },
      { $inc: { position: increment } }
    );

    task.position = position;
  }

  const updatedTask = await task.save();

  res.status(200).json({
    status: 'success',
    data: { task: updatedTask }
  });
});
