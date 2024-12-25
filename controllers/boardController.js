// Models
const Board = require('../models/board');
const Task = require('../models/task');

// Utils
const catchAsyncError = require('../utils/catchAsyncError');
const AppError = require('../utils/appError');

// Helpers
const updateBoardColumns = async (board, newColumns) => {
  if (board.columns.length === 0) {
    board.columns = newColumns || [];
    return;
  }

  if (!newColumns?.length) {
    await moveTasksToUnassigned(
      board,
      board.columns.map((col) => col.id)
    );
    board.columns = [board.unassignedColumn];
    return;
  }

  const existingColumnIds = board.columns.map((col) => col.id);
  const newColumnIds = newColumns.map((col) => col.id);

  const remainingColumnIds = existingColumnIds.filter((id) =>
    newColumnIds.includes(id)
  );
  const removedColumnIds = existingColumnIds.filter(
    (id) => !remainingColumnIds.includes(id)
  );

  if (removedColumnIds.length > 0) {
    await moveTasksToUnassigned(board, removedColumnIds);
  }

  board.columns = [
    ...board.columns.filter((col) => remainingColumnIds.includes(col.id)),
    ...newColumns.filter((col) => !remainingColumnIds.includes(col.id))
  ];
};

const moveTasksToUnassigned = async (board, columnIds) => {
  await Task.updateMany(
    { columnId: { $in: columnIds } },
    { columnId: board.unassignedColumn.id }
  );
};

// Handlers
exports.createBoard = catchAsyncError(async (req, res, next) => {
  const { name, columns } = req.body;

  const columnsData =
    columns && columns.length > 0
      ? columns.map((col) => ({ title: col }))
      : undefined;

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
  const { name, columns: newColumns } = req.body;

  const board = await Board.findById(req.params.id);

  if (!board) {
    return next(new AppError('Board not found.', 404));
  }

  board.name = name;

  await updateBoardColumns(board, newColumns);

  const updatedBoard = await board.save();

  res.status(200).json({
    status: 'success',
    data: { board: updatedBoard }
  });
});
