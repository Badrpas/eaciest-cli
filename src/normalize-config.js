const { resolve, join, dirname } = require('path');

module.exports = ({
  src = 'src',
  glob = '**/systems/**/*.js',
  systemSetupFile = 'system-setup.js',
  systemsExportFunctionName = 'setup_systems'
} = {}) => {
  const srcDir = resolve(process.cwd(), src);
  const srcGlob = join(srcDir, glob);
  const systemsSetupPath = resolve(srcDir, systemSetupFile);
  const systemsSetupDir = dirname(systemsSetupPath);

  return {
    srcDir,
    srcGlob,
    systemsSetupPath,
    systemsSetupDir,
    systemsExportFunctionName,
  };
};
