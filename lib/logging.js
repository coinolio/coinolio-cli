const chalk = require('chalk');

/* istanbul ignore next */
module.exports = {
  error: function(msg) {
    console.error('\n' + chalk.bold.red(msg));
  },

  warn(msg) {
    console.log(chalk.bold.orange(msg));
  },

  info(msg) {
    console.log(msg);
  }
};
