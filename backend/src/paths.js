const path = require('path');

const BASE_DIR = process.env.BASE_DIR || '/home/claude';

module.exports = {
  BASE_DIR,
  STATE_FILE: path.join(BASE_DIR, 'shared/state.json'),
  TASKS_FILE: path.join(BASE_DIR, 'shared/tasks.json'),
  LOGS_DIR: path.join(BASE_DIR, 'shared/logs'),
  SCRIPTS_DIR: path.join(BASE_DIR, 'scripts'),
};
