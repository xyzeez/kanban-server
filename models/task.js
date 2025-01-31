const { model, Schema } = require('mongoose');

// Utils
const AppError = require('../utils/appError');

// Helpers
const validateSubtasksLength = (subtasks) => {
  if (subtasks.length === 0) return true;

  return subtasks.every((subtask) => {
    return (
      typeof subtask.title === 'string' &&
      subtask.title.length >= 2 &&
      subtask.title.length <= 100
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
      maxlength: [150, 'Task title cannot exceed 150 characters.']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Task description cannot exceed 500 characters.']
    },
    subtasks: {
      type: [subtaskSchema],
      default: [],
      validate: [
        validateSubtasksLength,
        'Each subtask must be a string of 2-100 characters long'
      ]
    },
    columnId: {
      type: Schema.Types.ObjectId,
      required: [true, 'Task column id is required.']
    },
    boardId: {
      type: Schema.Types.ObjectId,
      required: [true, 'Board ID is required']
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false
    }
  }
);

// Schema indexing
taskSchema.index(
  { title: 1, columnId: 1 },
  {
    unique: true,
    collation: { locale: 'en', strength: 2, caseLevel: false },
    name: 'unique_title_per_column'
  }
);

// Virtuals
taskSchema.virtual('doneSubtaskCount').get(function () {
  return this.subtasks.filter((subtask) => subtask.completed).length;
});

// Middlewares
taskSchema.post('save', function (error, doc, next) {
  if (error.code === 11000) {
    next(
      new AppError(
        `A task with ${
          error.keyValue.title
            ? `the title "${error.keyValue.title}"`
            : 'this title'
        } already exists in this column`,
        409
      )
    );
  } else {
    next(error);
  }
});

// Model
const Task = model('task', taskSchema);

module.exports = Task;
