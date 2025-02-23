const Board = require('../models/board');
const Task = require('../models/task');
const demoContent = require('../data/demo.json');

const createDemoData = async (userId) => {
  const demoBoard = await Board.create({
    ...demoContent.board,
    ownerId: userId
  });

  const tasks = demoContent.tasks.map((task) => ({
    title: task.title,
    description: task.description,
    subtasks: task.subtasks,
    columnId: demoBoard.columns[task.columnIndex]._id,
    boardId: demoBoard._id,
    position: task.position
  }));

  await Task.create(tasks);

  return demoBoard;
};

module.exports = createDemoData;
