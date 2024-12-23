const { model, Schema, SchemaType } = require('mongoose');

// Utils
const AppError = require('../utils/appError');
const catchAsyncError = require('../utils/catchAsyncError');
const validateAssignedUser = require('../utils/validateAssignedUser');

// Helpers
const validateSubtasksLength = (subtasks) => {
  return subtasks.length > 0;
};

// Models
const Board = require('./board');

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
    default: false,
    required: true
  }
});

const taskSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, 'Task title is required.'],
      minlength: [3, 'Task title must be at least 3 characters long.'],
      maxlength: [150, 'Task title cannot exceed 150 characters.']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Task description cannot exceed 500 characters.']
    },
    subtasks: {
      type: [subtaskSchema],
      validate: [
        validateSubtasksLength,
        'A task must have at least one subtask.'
      ]
    },
    column: {
      type: String,
      trim: true,
      required: [true, 'Task column is required.']
    },
    board: {
      type: SchemaType.ObjectId,
      ref: 'Board',
      required: [true, 'Task board id is required.']
    },
    OwnerId: {
      type: SchemaType.ObjectId,
      ref: 'User',
      required: [validateAssignedUser, 'Task user id is required.']
    }
  },
  { timestamps: true }
);

// Compound indexing
taskSchema.index(
  { name: 1, board: 1 },
  {
    unique: true,
    collation: { locale: 'en', strength: 2 }
  }
);

// Middlewares
taskSchema.pre(
  'save',
  catchAsyncError(async function (next) {
    if (!this.isModified('column')) return next();

    const board = await Board.findById(this.board);

    if (!board) {
      return next(
        new AppError('The board associated with this task does not exist.', 400)
      );
    }

    if (!board.columns.includes(this.column)) {
      return next(
        new AppError(`Column must be one of: ${board.columns.join(', ')}.`, 400)
      );
    }

    next();
  })
);

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
