const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// Configs
const { API_BASE_URL, ALLOWED_ORIGINS, RATE_LIMIT } = require('./config');

// Controllers
const {
  noEndpointHandler,
  globalErrorHandler
} = require('./controllers/errorController');

// Routers
const authRouter = require('./routes/authRoute');
const boardRouter = require('./routes/boardRoute');
const taskRouter = require('./routes/taskRoute');
const userRouter = require('./routes/userRoute');

// App setup
const app = express();

// Middlewares
app.use(helmet());

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

if (process.env.NODE_ENV === 'production')
  app.use(API_BASE_URL, rateLimit(RATE_LIMIT));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true
  })
);

// Endpoints
app.use(`${API_BASE_URL}/auth`, authRouter);
app.use(`${API_BASE_URL}/boards`, boardRouter);
app.use(`${API_BASE_URL}/tasks`, taskRouter);
app.use(`${API_BASE_URL}/users`, userRouter);

// Error Handlers
app.all('*', noEndpointHandler);
app.use(globalErrorHandler);

module.exports = app;
