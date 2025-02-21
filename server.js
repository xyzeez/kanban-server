const dotenv = require('dotenv');
const mongoose = require('mongoose');

// env
dotenv.config({ path: ['.env', `.env.${process.env.NODE_ENV}`] });

// Utils
const {
  monitorUncaughtRejection,
  monitorUnhandledRejection
} = require('./utils/monitorRejections');

// Services
const cleanupDatabase = require('./services/cleanupService');
const gracefulShutdown = require('./services/shutdownService');

// Configs
const { PORT, DB } = require('./config');

// App
const app = require('./app');
let server;
let cleanupInterval;

// Server setup
const init = () => {
  console.log('\n========== SERVER INITIALIZATION ==========\n');
  console.log('Starting server initialization process...\n');

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
      console.log('✓ Database connection established\n');

      cleanupInterval = setInterval(cleanupDatabase, 24 * 60 * 60 * 1000);
      console.log('✓ Database cleanup scheduled (daily)\n');
      console.log('==========================================\n');
    })
    .catch((err) => {
      console.error('Database connection failed:\n', err);
    });

  server = app.listen(PORT, () => {
    console.log(`✓ Server listening on port ${PORT}\n`);
  });

  monitorUnhandledRejection(server);

  process.on('SIGTERM', () => gracefulShutdown({ server, cleanupInterval }));
};

// Start Server
init();
