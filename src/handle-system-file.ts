import chalk from 'chalk';
import { relative, dirname } from 'path';
import { extract_systems } from './extract-systems';
import { aggregate_systems } from './aggregate-systems';
import type { Config } from './config';
import AsyncLock from 'async-lock';

const lock = new AsyncLock;

export const handleSystemFile = async function handleSystemFile(path: string, config: Config) {
    try {
        await lock.acquire(path, async () => {
            const relativePath = relative(dirname(config.systemAggregationFile), path)
                .replace(/\\/g, '/')
                .replace(/\.[jt]s$/, '');
            const importPath = /\.\.\//.test(relativePath) ? relativePath : `./${relativePath}`;

            const systems = await extract_systems(path);

            config.silent || console.log(`Handling system file ${chalk.green(importPath)} with ${
                systems.map(system => chalk.blue(system.name)).join(', ')
            }`);

            await aggregate_systems({
                importPath,
                systems,
            }, config);
        });
    } catch (err) {
        console.error(err);
    }
};

