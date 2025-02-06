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
    .then(() => {
      mongoose.set('toJSON', {
        transform: function (doc, ret) {
          ret.id = ret._id;
          return ret;
        }
      });
    })
    .then(() => console.log('Database connection successful'))
    .catch((err) => console.error('Database connection error:', err));

  const server = app.listen(PORT, () => {
    console.log(`App running on port ${PORT}...`);
  });

  monitorUnhandledRejection(server);
};

// Start Server
init();
