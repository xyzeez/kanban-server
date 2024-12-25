const { model, Schema } = require('mongoose');

// Models
const Board = require('./board');

// Utils
const AppError = require('../utils/appError');

// Helpers
const validateSubtasksLength = (subtasks) => {
  if (subtasks.length === 0) return true;

  return subtasks.every((subtask) => {
    return (
      typeof subtask.title === 'string' &&
      subtask.title.length >= 2 &&
      subtask.title.length <= 50
    );
  });
};

// Schemas
const subtaskSchema = new Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Subtask title is required.'],
    minlength: [2, 'Subtask title must be at least 2 characters long.'],
    maxlength: [100, 'Subtask title cannot exceed 100 characters.']
  },
  completed: {
    type: Boolean,
    default: false
  }
});

const taskSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, 'Task title is required.'],
      minlength: [2, 'Task title must be at least 3 characters long.'],
      maxlength: [15, 'Task title cannot exceed 150 characters.']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [50, 'Task description cannot exceed 500 characters.']
    },
    subtasks: {
      type: [subtaskSchema],
      default: [],
      validate: [
        validateSubtasksLength,
        'Each subtask must be a string of 2-50 characters long'
      ]
    },
    boardId: {
      type: Schema.Types.ObjectId,
      ref: 'Board',
      required: [true, 'Task board id is required.']
    },
    columnId: {
      type: String,
      trim: true,
      required: [true, 'Task column id is required.']
    }
  },
  { timestamps: true }
);

// Schema indexing
taskSchema.index(
  { title: 1, boardId: 1, columnId: 1 },
  {
    unique: true,
    collation: { locale: 'en', strength: 2 }
  }
);

// Middlewares
taskSchema.pre('save', async function (next) {
  if (!this.isModified('columnId')) return next();

  const board = await Board.findById(this.boardId);

  if (!board) {
    return next(
      new AppError('The board associated with this task does not exist.', 400)
    );
  }

  const boardcolumnId = board.columns.map((col) => col.id);

  if (!boardcolumnId.includes(this.columnId)) {
    return next(
      new AppError(
        `Column must be one of: ${board.columns
          .map((col) => col.title)
          .join(', ')}.`,
        400
      )
    );
  }

  next();
});

taskSchema.post('save', function (error, doc, next) {
  if (error.code === 11000 && error.keyValue.name) {
    return next(
      new AppError(
        `A task with the name "${error.keyValue.name}" already exists.`,
        409
      )
    );
  }

  next(error);
});

// Model
const Task = model('task', taskSchema);

module.exports = Task;
