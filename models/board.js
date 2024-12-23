const { SchemaType, model, Schema } = require('mongoose');

// Utils
const AppError = require('../utils/appError');
const validateAssignedUser = require('../utils/validateAssignedUser');

// Helpers
const validateColumnsUnique = (columns) => {
  const uniqueColumns = new Set(columns);
  return columns.length > 0 && uniqueColumns.size === columns.length;
};

const validateColumnsLength = (columns) => {
  return columns.every((col) => col.length >= 2 && col.length <= 20);
};

// Schemas
const boardSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Board name is required'],
      trim: true,
      minlength: [3, 'Board name must be at least 3 characters long'],
      maxlength: [50, 'Board name cannot exceed 50 characters']
    },
    columns: {
      type: [String],
      validate: [
        {
          validator: validateColumnsUnique,
          message: 'Columns must not be empty or contain duplicates'
        },
        {
          validator: validateColumnsLength,
          message: 'Each column must be 2-20 characters long'
        }
      ]
    },
    ownerId: {
      type: SchemaType.ObjectId,
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
  { name: 1, owner: 1 },
  {
    unique: true,
    collation: { locale: 'en', strength: 2 }
  }
);

// Middlewares
boardSchema.pre('save', function (next) {
  if (!this.isModified('columns')) return next();

  this.columns = this.columns.map((col) => col.trim().toLowerCase());

  next();
});

boardSchema.post('save', function (error, doc, next) {
  if (error.code === 11000 && error.keyValue.name) {
    return next(
      new AppError(
        `A board with the name "${error.keyValue.name}" already exists.`,
        409
      )
    );
  }

  next(error);
});

// Model
const Board = model('Board', boardSchema);

module.exports = Board;
