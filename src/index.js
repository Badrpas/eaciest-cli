const fs = require('fs/promises');
const util = require('util');
const glob = util.promisify(require('glob'));
const normalizeConfig = require('./normalize-config');
const handleSystemFile = require('./handle-system-file');
const watchSystems = require('./watch-systems');

module.exports = (config) => {
  const configs = (config instanceof Array ? config : [config]).filter(x => !!x);

  configs.forEach(async config => {
    const c = normalizeConfig(config);

    try {
      await fs.stat(c.systemsSetupFile)
    } catch (err) {
      if (err.code === 'ENOENT') {
        await fs.writeFile(c.systemsSetupFile, '');
      }
    }

    const paths = await glob(c.glob);
    paths.forEach(path => handleSystemFile(path, c));

    if (typeof config.watch === 'undefined' || config.watch === true) {
      watchSystems(config);
    }
  });

};

module.exports.handleSystemFile = require('./handle-system-file');
