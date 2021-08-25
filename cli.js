#!/usr/bin/env node

const eaciestCli = require('./src');
const get_config = require('./get-config');

eaciestCli(get_config());
