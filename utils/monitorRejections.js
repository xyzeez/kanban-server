exports.monitorUncaughtRejection = () => {
  process.on('uncaughtException', (err) => {
    console.log('========== UNCAUGHT EXCEPTION ==========');
    console.error(err);
    console.log('========================================');
    console.log('SERVER IS SHUTTING DOWN...');
    console.log('========================================');
    process.exit(1);
  });
};

exports.monitorUnhandledRejection = (server) => {
  process.on('unhandledRejection', (err) => {
    console.log('========== UNHANDLED REJECTION ==========');
    console.error(err);
    console.log('========================================');
    console.log('SERVER IS SHUTTING DOWN...');
    console.log('========================================');
    server.close(() => process.exit(1));
  });
};
