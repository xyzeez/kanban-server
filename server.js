const dotenv = require('dotenv');
const mongoose = require('mongoose');

// env
dotenv.config();

// Utils
const {
  monitorUncaughtRejection,
  monitorUnhandledRejection
} = require('./utils/monitorRejections');

// Configs
const { PORT, DB } = require('./config');

// App
const app = require('./app');

// Server setup
const init = () => {
  monitorUncaughtRejection();

  mongoose
    .connect(DB)
    .then(() => console.log('Database connection successful'));

  const server = app.listen(PORT, () => {
    console.log(`App running on port ${PORT}...`);
  });

  monitorUnhandledRejection(server);
};

// Start Server
init();
