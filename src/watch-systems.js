const chalk = require('chalk');
const chokidar = require('chokidar');
const handleSystemFileChange = require('./handle-system-file');
const normalizeConfig = require('./normalize-config');


const watchSystems = async (options = {}) => {
  const config = normalizeConfig(options);
  const { srcGlob, systemsSetupPath } = config;


  chokidar.watch(srcGlob)
    .on('change', path => {
      handleSystemFileChange(path, config);
    })
    .on('unlink', (path) => {

    });

  console.log(`Watching systems changes under ${chalk.green(srcGlob)} for later updates to ${chalk.green(systemsSetupPath)}`);
};


module.exports = watchSystems;
