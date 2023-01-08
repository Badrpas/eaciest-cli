import { green } from 'chalk';
import { watch, type WatchOptions } from 'chokidar';
import { handleSystemFile } from './handle-system-file';
import type { Config } from './config';

export const watchSystems = async (config: Config) => {
    const opt: WatchOptions = {
        ignoreInitial: true,
        ignored: config.systemAggregationFile,
    };

    watch(config.glob, opt)
        .on('add', async path => {
            handleSystemFile(path, config);
        })
        .on('change', path => {
            handleSystemFile(path, config);
        })
        .on('unlink', (path) => {
            handleSystemFile(path, config);
        });

    console.log(`Watching systems changes under ${green(config.glob)} for later updates to ${green(config.systemAggregationFile)}`);
};


