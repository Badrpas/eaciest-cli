import AsyncLock from 'async-lock';
import * as recast from 'recast';
import fs from 'fs/promises';
import { ensure_systems_init, ensure_systems_import } from './ensure';
import { rparse } from './parser';
import { file_exists } from './util';
import type { Config } from './config';
import type { SystemInfo } from './extract-systems';
import chalk from 'chalk';

const lock = new AsyncLock;

export interface Options {
    importPath: string,
    systems: SystemInfo[],
}


const get_init_node = (name: string, world_id: string) => {
    return `${world_id}.addSystemClass(${name});`;
};

export const aggregate_systems = async ({ importPath, systems = [] }: Options, config: Config) => {
    await lock.acquire(config.systemAggregationFile, async () => {
        if (!await file_exists(config.systemAggregationFile)) {
            await fs.writeFile(config.systemAggregationFile, '');
        }
        const src = await fs.readFile(config.systemAggregationFile, 'utf-8');

        const ast = rparse(src, config);

        const importNodes = ast.program.body.filter((n: any) => n.type === 'ImportDeclaration');
        let importNode = importNodes.find((n: any) => n.source.value === importPath);

        if (!systems.length) { // Remove import and usages
            if (!importNode) return;
            const prevNames = importNode.specifiers.map((s: any) => {
                return s.imported?.name;
            }).filter((x: string|void) => !!x);
            const idx = ast.program.body.indexOf(importNode);
            ast.program.body.splice(idx, 1);
            const { body } = ensure_systems_init(ast.program, config);
            const to_remove = [];
            for (let node of body) {
                const { code } = recast.print(node);
                if (prevNames.some((name: string) => code.includes(name))) {
                    to_remove.unshift(body.indexOf(node));
                }
            }
            for (const idx of to_remove) {
                body.splice(idx, 1);
            }
        } else { // Add import and usages
            // fix colliding names
            for (let node of importNodes) {
                if (node.source.value === importPath) continue;
                for (let specifier of node.specifiers) {
                    if (systems.some(s => s.name === specifier.imported?.name)) {
                        const idx = node.specifiers.indexOf(specifier);
                        node.specifiers.splice(idx, 1);
                        console.log(`Removed ${chalk.blue(specifier.imported.name)} from imports of ${chalk.green(node.source.value)}`);
                    }
                }
            } 

            if (!importNode) {
                const importAst = rparse(`import {} from '${importPath}';\n`, config);
                ast.program.body.unshift(importNode = importAst.program.body[0]);
            }

            ensure_systems_import(importNode, systems, importPath);
            const { bodyCode, body, world_id } = ensure_systems_init(ast.program, config);

            for (const { name } of systems) {
                if (bodyCode.includes(name)) {
                    continue;
                }
                body.push(get_init_node(name, world_id));
                console.log(`Added ${chalk.blue(name)} initialization`);
            }
        }

        const outSrc = recast.print(ast).code;

        await fs.writeFile(config.systemAggregationFile, outSrc);
    });
};
