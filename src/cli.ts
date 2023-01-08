#!/usr/bin/env node

import fs from 'fs/promises';
import { resolve } from 'path';
import { promisify } from 'util';
import glob from 'glob';
import { watchSystems } from "./watch-systems";
import { handleSystemFile } from './handle-system-file';
import { Config, normalize } from "./config";

const read_config = async (): Promise<Partial<Config>> => {
    const module_path = resolve(process.cwd(), 'eaciest.config.js');
    try {
        return (await import(module_path)).default || {};
    } catch (err) {
        const moduleNotFound = err.message.includes('Cannot find module') && err.message.split('\n')[0]?.includes(module_path);
        if (!moduleNotFound) {
            console.error(err);
        }
    }

    try {
        const text = await fs.readFile(resolve(process.cwd(), 'eaciest.config.json'), 'utf-8');
        return JSON.parse(text);
    } catch (err) {
        if (err instanceof SyntaxError) {
            throw err;
        }
        return {};
    }
}

async function run() {
    const config = normalize(await read_config())

    if (process.argv.includes('--silent')) {
        config.silent = true;
    }

    const paths = await promisify(glob)(config.glob);
    await Promise.all(paths.map(path => handleSystemFile(path, config)));

    if (process.argv.includes('--watch')) {
        watchSystems(config);
    }
};

run().catch(console.error);


