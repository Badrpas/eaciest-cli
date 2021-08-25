const { resolve, join, dirname, isAbsolute } = require('path');
const defaultConfig = require('../eaciest.default.config.json');


module.exports = (config = {}) => {
  const c = Object.assign({}, defaultConfig, config);

  c.root = resolve(process.cwd(), c.root);
  if (!isAbsolute(c.glob)) {
    c.glob = join(c.root, c.glob);
  }
  if (!isAbsolute(c.systemsSetupFile)) {
    c.systemsSetupFile = resolve(c.root, c.systemsSetupFile);
  }
  c.systemsSetupDir = dirname(c.systemsSetupFile);

  return c;
};
