#!/usr/bin/env node

const { resolve } = require('path');
const eaciestCli = require('./src');

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

eaciestCli(config);
