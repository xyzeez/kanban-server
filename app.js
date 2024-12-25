const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

// Configs
const { API_BASE_URL } = require('./config');

// Controllers
const {
  noEndpointHandler,
  globalErrorHandler
} = require('./controllers/errorController');

// Routers
const authRouter = require('./routes/authRoute');
const boardRouter = require('./routes/boardRoute');

// App setup
const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Endpoints
app.use(`${API_BASE_URL}/auth`, authRouter);
app.use(`${API_BASE_URL}/boards`, boardRouter);

// Error Handlers
app.all('*', noEndpointHandler);
app.use(globalErrorHandler);

module.exports = app;
