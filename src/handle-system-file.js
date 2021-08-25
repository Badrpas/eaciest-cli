const chalk = require('chalk');
const fs = require('fs');
const { relative } = require('path');
const extractSystems = require('./extract-systems');
const aggregateSystems = require('./aggregate-systems');


const ACORN_OPTIONS = {
  sourceType: 'module',
  ecmaVersion: 'latest',
};


module.exports = function handleSystemFileChange (path, config) {
  const importPath = './' + relative(config.systemsSetupDir, path)
    .replace(/\\/g, '/')
    .replace(/\.js$/, '');

  console.log(`Handling system file ${chalk.green(importPath)}`);

  const src = fs.readFileSync(path, { encoding: 'utf-8' });
  const systems = extractSystems(src, {
    acorn: {
      ...ACORN_OPTIONS,
      ...(config.acorn ?? {}),
    },
  });

  const setupSrc = fs.readFileSync(config.systemsSetupFile).toString();

  const outSetupSrc = aggregateSystems({
    exportFnName: config.functionName,
    src: setupSrc,
    importPath,
    systems,
  });

  fs.writeFileSync(config.systemsSetupFile, outSetupSrc);
};
