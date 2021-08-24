const chalk = require('chalk');
const fs = require('fs');
const { relative } = require('path');
const extractSystems = require('./extract-systems');
const aggregateSystems = require('./aggregate-systems');


const ACORN_OPTIONS = {
  sourceType: 'module',
  ecmaVersion: 'latest',
};


module.exports = function handleSystemFileChange (path, options) {
  const src = fs.readFileSync(path, { encoding: 'utf-8' });
  const systems = extractSystems(src, {
    acorn: {
      ...(options.acorn ?? {}),
      ...ACORN_OPTIONS,
    },
  });

  const importPath = './' + relative(options.systemsSetupDir, path).replace(/\\/g, '/').replace(/\.js$/, '');
  console.log(`System file ${chalk.green(importPath)} changed`);
  const setupSrc = fs.readFileSync(options.systemsSetupPath).toString();

  const outSetupSrc = aggregateSystems({
    src: setupSrc,
    importPath,
    systems,
    exportFnName: options.systemsExportFunctionName,
  });

  fs.writeFileSync(options.systemsSetupPath, outSetupSrc);
};
