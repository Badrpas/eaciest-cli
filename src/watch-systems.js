const chalk = require('chalk');
const chokidar = require('chokidar');
const handleSystemFileChange = require('./handle-system-file');
const normalizeConfig = require('./normalize-config');


const watchSystems = async (options = {}) => {
  const config = normalizeConfig(options);

  chokidar.watch(config.glob)
    .on('change', path => {
      handleSystemFileChange(path, config);
    })
    .on('unlink', (path) => {

    });

  console.log(`Watching systems changes under ${chalk.green(config.glob)} for later updates to ${chalk.green(config.systemsSetupFile)}`);
};


module.exports = watchSystems;
