const { model, Schema } = require('mongoose');

// Models
const User = require('./user');

// Utils
const AppError = require('../utils/appError');
const catchAsyncError = require('../utils/catchAsyncError');

// Helpers
const validateAssignedUser = catchAsyncError(async (userId) => {
  return await User.exists({ _id: userId });
});

const validateColumnsLength = (columns) => {
  if (columns.length === 0) return true;

  return columns.every(
    (col) =>
      typeof col.title === 'string' &&
      col.title.length >= 2 &&
      col.title.length <= 20
  );
};

const validateColumnsUnique = (columns) => {
  if (columns.length === 0) return true;

  const columnTitles = columns.map((col) => col.title);
  const uniqueColumnTitles = new Set(columnTitles);

  return uniqueColumnTitles.size === columns.length;
};

// Schemas
const columnSchema = new Schema({
  title: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: [true, 'Column title is required'],
    minlength: [3, 'Column title must be at least 3 characters long'],
    maxlength: [50, 'Column title cannot exceed 50 characters']
  }
});

const boardSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Board name is required'],
      trim: true,
      lowercase: true,
      minlength: [3, 'Board name must be at least 3 characters long'],
      maxlength: [50, 'Board name cannot exceed 50 characters']
    },
    columns: {
      type: [columnSchema],
      default: [],
      validate: [
        { validator: Array.isArray, message: 'Columns must be an array' },
        {
          validator: validateColumnsLength,
          message: 'Each column must be a string of 2-20 characters long'
        },
        {
          validator: validateColumnsUnique,
          message: 'Columns must not be empty or contain duplicates'
        }
      ]
    },
    unassignedColumn: columnSchema,
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Board owner id is required'],
      validate: [validateAssignedUser, 'Board owner does not exist']
    }
  },
  {
    timestamps: true
  }
);

// Schema Index
boardSchema.index(
  { name: 1, ownerId: 1 },
  {
    unique: true,
    collation: { locale: 'en', strength: 2 }
  }
);

// Middlewares
boardSchema.pre('save', async function (next) {
  if (!this.isNew) return next();

  this.unassignedColumn = { title: 'unassigned' };

  next();
});

boardSchema.post('save', function (error, doc, next) {
  if (error.code === 11000) {
    return next(
      new AppError(
        `A board with the name "${doc.name}" already exists for this user.`,
        409
      )
    );
  }

  next(error);
});

// Model
const Board = model('Board', boardSchema);

module.exports = Board;
