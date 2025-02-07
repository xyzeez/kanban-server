const User = require('../models/user');
const Board = require('../models/board');
const Task = require('../models/task');

const CLEANUP_THRESHOLD_DAYS = process.env.CLEANUP_THRESHOLD_DAYS || 7;

const cleanupDatabase = async () => {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - CLEANUP_THRESHOLD_DAYS);

  try {
    const oldUsers = await User.find({
      createdAt: { $lt: thresholdDate }
    });

    for (const user of oldUsers) {
      await Board.deleteMany({ ownerId: user._id });
      await Task.deleteMany({ ownerId: user._id });
      await User.deleteOne({ _id: user._id });
    }

    console.log(
      `Cleanup completed: Removed data older than ${CLEANUP_THRESHOLD_DAYS} days`
    );
  } catch (error) {
    console.error('Database cleanup failed:', error);
  }
};

module.exports = cleanupDatabase;
