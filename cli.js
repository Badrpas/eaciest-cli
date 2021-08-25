#!/usr/bin/env node

const { resolve } = require('path');
const eaciestCli = require('./src');

const [,, ...args] = process.argv;
const DEFAULT_CONFIG_PATH = './eaciest.config';

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

const get_config = (configFileName = get_config_file_name()) => {
  const configPath = resolve(process.cwd(), configFileName);
  try {
    return require(configPath);
  } catch (err) {
    return {};
  }
}

const config = get_config();

eaciestCli(config);

module.exports = {
  get_config
};
