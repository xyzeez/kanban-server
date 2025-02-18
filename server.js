const dotenv = require('dotenv');
const mongoose = require('mongoose');

// env
dotenv.config();

// Utils
const {
  monitorUncaughtRejection,
  monitorUnhandledRejection
} = require('./utils/monitorRejections');
const cleanupDatabase = require('./utils/cleanupService');
const gracefulShutdown = require('./utils/shutdownService');

// Configs
const { PORT, DB } = require('./config');

// App
const app = require('./app');
let server;
let cleanupInterval;

// Server setup
const init = () => {
  monitorUncaughtRejection();

  mongoose
    .connect(DB)
    .then(() => {
      mongoose.set('toJSON', {
        transform: function (doc, ret) {
          ret.id = ret._id;
          return ret;
        }
      });
    })
    .then(() => {
      console.log('Database connection successful');

      // Schedule database cleanup to run daily at midnight
      const CLEANUP_INTERVAL = process.env.CLEANUP_INTERVAL_HOURS || 24;
      cleanupInterval = setInterval(
        cleanupDatabase,
        CLEANUP_INTERVAL * 60 * 60 * 1000
      );
      console.log(
        `Database cleanup scheduled to run every ${CLEANUP_INTERVAL} hours`
      );
    })
    .catch((err) => console.error('Database connection error:', err));

  server = app.listen(PORT, () => {
    console.log(`App running on port ${PORT}...`);
  });

  monitorUnhandledRejection(server);

  process.on('SIGTERM', () => gracefulShutdown({ server, cleanupInterval }));
};

// Start Server
init();
