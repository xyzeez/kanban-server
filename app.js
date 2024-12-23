const express = require('express');
const morgan = require('morgan');

// Controllers
const {
  noEndpointHandler,
  globalErrorHandler
} = require('./controllers/errorController');

// Variable
const app = express();

// Middlewares
app.use(express.json());
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Endpoints

// Error Handlers
app.all('*', noEndpointHandler);
app.use(globalErrorHandler);

module.exports = app;
