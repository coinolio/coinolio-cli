const cli = require('cli');
const path = require('path');
const debug = require('debug')('coinolio-cli:cli');
const options = require('./options');
const log = require('./logging');
const coinolio = require('./coinolio');

const command = {
  interpret(args) {
    cli.setArgv(args);
    cli.options = {};

    cli.enable('version', 'glob', 'help');
    cli.setApp(path.resolve(`${__dirname}/../package.json`));

    const opts = cli.parse(options);

    debug('Checking arguments are valid');

    if (!opts.url) {
      log.error('A Coinolio URL must be specified.');
      return 1;
    }

    /* istanbul ignore next */
    command.run(opts, (code) => {
      debug(`Exiting with code ${code}`);
      process.exit(code);
    });
  },

  run(opts, cb) {
    debug('Running...', opts);
    if (opts.visual) {
      coinolio.dashboard(opts);
    }
  }
};
module.exports = command;
