// Models
const User = require('../models/user');
const Board = require('../models/board');
const Task = require('../models/task');

// Configs
const { CLEANUP_THRESHOLD_DAYS } = require('../config');

const cleanupDatabase = async () => {
  console.log('\n========== DATABASE CLEANUP STARTED ==========');
  console.log('Starting database cleanup process...');
  console.log('==========================================\n');

  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - CLEANUP_THRESHOLD_DAYS);

  try {
    const oldUsers = await User.find({
      createdAt: { $lt: thresholdDate }
    });

    if (oldUsers.length > 0) {
      for (const user of oldUsers) {
        await Promise.all([
          Board.deleteMany({ ownerId: user._id }),
          Task.deleteMany({ ownerId: user._id })
        ]);
        await User.deleteOne({ _id: user._id });
      }
    }

    console.log('========== CLEANUP COMPLETED ==========');
    console.log('=====================================\n');
  } catch (error) {
    console.log('\n========== CLEANUP FAILED ==========');
    console.error('Error during cleanup:', error);
    console.log('==================================\n');
  }
};

module.exports = cleanupDatabase;
