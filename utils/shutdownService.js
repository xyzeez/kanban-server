const mongoose = require('mongoose');

const gracefulShutdown = async ({ server, cleanupInterval }) => {
  console.log('\n========== SIGTERM RECEIVED ==========');
  console.log('Starting graceful shutdown process...');
  console.log('=====================================\n');

  // Clear the cleanup interval
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    console.log('✓ Cleanup interval cleared');
  }

  // Close the server
  if (server) {
    console.log('\n========== CLOSING HTTP SERVER ==========');
    await new Promise((resolve) => server.close(resolve));
    console.log('✓ HTTP server closed successfully');
    console.log('=======================================\n');
  }

  // Close database connection
  if (mongoose.connection.readyState === 1) {
    console.log('========== CLOSING DATABASE ==========');
    await mongoose.connection.close();
    console.log('✓ Database connection closed successfully');
    console.log('====================================\n');
  }

  console.log('========== SHUTDOWN COMPLETE ==========');
  console.log('All resources cleaned up successfully');
  console.log('Server shutdown completed gracefully');
  console.log('=====================================\n');

  process.exit(0);
};

module.exports = gracefulShutdown;
