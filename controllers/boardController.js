// Models
const Board = require('../models/board');
const Task = require('../models/task');

// Utils
const catchAsyncError = require('../utils/catchAsyncError');
const AppError = require('../utils/appError');

// Helpers
const moveTasksToUnassigned = async (board, columnIds) => {
  // First check if there are any tasks in the columns being removed
  const tasksExist = await Task.exists({ columnId: { $in: columnIds } });

  if (tasksExist) {
    await Task.updateMany(
      { columnId: { $in: columnIds } },
      { columnId: board.unassignedColumn.id }
    );
    return true; // Return true if tasks were moved
  }
  return false; // Return false if no tasks were moved
};

const updateBoardColumns = async (board, newColumns) => {
  // Handle case when board has no columns
  if (board.columns.length === 0) {
    board.columns = newColumns || [];
    return;
  }

  // Handle case when all columns are being removed
  if (!newColumns?.length) {
    const hasMovedTasks = await moveTasksToUnassigned(
      board,
      board.columns.map((col) => col.id)
    );
    board.columns = hasMovedTasks ? [board.unassignedColumn] : [];
    return;
  }

  // Check for duplicate column IDs in new columns
  const duplicateIds = newColumns.filter(
    (col, index) => newColumns.findIndex((c) => c.id === col.id) !== index
  );
  if (duplicateIds.length > 0) {
    throw new AppError('Duplicate column IDs are not allowed', 400);
  }

  const existingColumnIds = new Set(board.columns.map((col) => col.id));
  const newColumnIds = new Set(newColumns.map((col) => col.id));

  // Find removed column IDs
  const removedColumnIds = [...existingColumnIds].filter(
    (id) => !newColumnIds.has(id)
  );

  // Move tasks from removed columns to unassigned if needed
  let hasMovedTasks = false;
  if (removedColumnIds.length > 0) {
    hasMovedTasks = await moveTasksToUnassigned(board, removedColumnIds);
  }

  // Update columns while preserving existing IDs but accepting all other new properties
  let updatedColumns = newColumns.map((newCol) => {
    const existingColumn = board.columns.find((col) => col.id === newCol.id);
    if (existingColumn) {
      // Keep the existing ID but update all other properties
      return {
        ...newCol,
        id: existingColumn.id
      };
    }
    return newCol;
  });

  // Add unassignedColumn only if tasks were moved there
  if (hasMovedTasks && !newColumnIds.has(board.unassignedColumn.id)) {
    updatedColumns.push(board.unassignedColumn);
  }

  return updatedColumns;
};

// Handlers
exports.getBoards = catchAsyncError(async (req, res, next) => {
  const boards = await Board.find({ ownerId: req.user.id }).select('id name');

  res.status(200).json({
    status: 'success',
    data: { boards }
  });
});

exports.getBoard = catchAsyncError(async (req, res, next) => {
  const board = await Board.findById(req.params.id).select(
    'id name columns unassignedColumn'
  );

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

  const board = await Board.findById(req.params.id);

  if (!board) {
    return next(new AppError('Board not found.', 404));
  }

  board.name = name;

  board.columns = await updateBoardColumns(board, columns);

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

  await Task.deleteMany({ boardId: board._id });

  res.status(204).json({
    status: 'success',
    data: null
  });
});
