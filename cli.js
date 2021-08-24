#!/usr/bin/env node

const fs = require('fs/promises');
const util = require('util');
const { resolve } = require('path');
const glob = util.promisify(require('glob'));
const normalizeConfig = require('./src/normalize-config');
const handleSystemFile = require('./src/handle-system-file');
const watchSystems = require('./src/watch-systems');

const [,, ...args] = process.argv;
const DEFAULT_CONFIG_PATH = './eaciest.config.json';

const get_config_file_name = () => {
  const idx = args.findIndex(x => x.includes('--config'));
  if (idx === -1) {
    return DEFAULT_CONFIG_PATH;
  }
  const match = /^--config(=(.+))$?/.exec(args[idx]);
  if (match && match[2]) {
    return match[2];
  }
  return args[idx + 1];
}

const get_config = () => {
  const configPath = resolve(process.cwd(), get_config_file_name());
  try {
    return require(configPath);
  } catch (err) {
    return {};
  }
}

const config = get_config();

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


