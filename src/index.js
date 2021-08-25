const fs = require('fs/promises');
const util = require('util');
const glob = util.promisify(require('glob'));
const normalizeConfig = require('./normalize-config');
const handleSystemFile = require('./handle-system-file');
const watchSystems = require('./watch-systems');

module.exports = (rawConfig) => {
  const rawConfigs = (rawConfig instanceof Array ? rawConfig : [rawConfig]).filter(x => !!x);

  rawConfigs.forEach(async rawConfig => {
    const config = normalizeConfig(rawConfig);

    try {
      await fs.stat(config.systemsSetupFile)
    } catch (err) {
      if (err.code === 'ENOENT') {
        await fs.writeFile(config.systemsSetupFile, '');
      }
    }

    const paths = await glob(config.glob);
    paths.forEach(path => handleSystemFile(path, config));

    if (typeof config.watch === 'undefined' || config.watch === true) {
      watchSystems(config);
    }
  });

};

module.exports.handleSystemFile = require('./handle-system-file');
