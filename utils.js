exports.monitorUncaughtRejection = () => {
  process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT REJECTION, Shutting Down...');
    process.exit(1);
  });
};

exports.monitorUnhandledRejection = (server) => {
  process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION, Shutting Down...');
    server.close(() => process.exit(1));
  });
};
