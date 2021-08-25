const fs = require('fs/promises');
const util = require('util');
const glob = util.promisify(require('glob'));
const normalizeConfig = require('./normalize-config');
const handleSystemFile = require('./handle-system-file');
const watchSystems = require('./watch-systems');

module.exports = (config) => {
  const configs = (config instanceof Array ? config : [config]).filter(x => !!x);

  configs.forEach(async config => {
    const normalizedConfig = normalizeConfig(config);
    const {
      systemsSetupPath,
      srcGlob,
    } = normalizedConfig;

    try {
      await fs.stat(systemsSetupPath)
    } catch (err) {
      if (err.code === 'ENOENT') {
        await fs.writeFile(systemsSetupPath, '');
      }
    }

    const paths = await glob(srcGlob);
    paths.forEach(path => handleSystemFile(path, normalizedConfig));

    watchSystems(config);
  });

};
