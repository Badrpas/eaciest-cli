import * as recast from 'recast';
import chalk from 'chalk';
import type { SystemInfo } from './extract-systems';
import type { Config } from './config';
import { rparse } from './parser';

const b = recast.types.builders;

const DEFAULT_WORLD_ID = 'world';


const getDefaultId = (importPath: string) => {
    return importPath.replace(/\//g, '_').replace(/\./g, '_');
}

const ensure_systems_import = (node: any, systems: SystemInfo[], importPath: string, config: Config): void => {
    for (const system of systems) {

        const isDefault = system.name === 'default';
        if (isDefault) {
            system.name = getDefaultId(importPath); // WARN mutating the system object
            if (node.specifiers.some((x: any) => x.type === 'ImportDefaultSpecifier')) continue;
        } else {
            if (node.specifiers.some((x: any) => x.imported?.name === system.name)) continue;
        }

        const id = b.identifier(system.name);

        config.silent || console.log(`Adding import specifier ${chalk.blue(id.name)} from ${chalk.green(importPath)}`);

        const specifier = isDefault ? b.importDefaultSpecifier(id) : b.importSpecifier(id);
        node.specifiers.push(specifier);
    }
}

const ensure_system_init_fn = (exportFnName: string, program: any, config: Config) => {
    for (const node of program.body) {
        if (node.type === 'ExportNamedDeclaration') {
            if (node.declaration?.declarations?.[0]?.id?.name === exportFnName) {
                return node.declaration?.declarations?.[0].init;
            }
        }
    }

    const ast = rparse(`
  
${config.useTs ? `import { Engine } from 'eaciest';` : ''}
export const ${exportFnName} = (world${config.useTs ? ': Engine' : ''}) => {

};
`, config);

    if (config.useTs) {
        program.body.push(ast.program.body[0]);
    }
    const node = ast.program.body[config.useTs ? 1 : 0];
    program.body.push(node);
    return node.declaration?.declarations?.[0].init;
}

const ensure_world_id = (fnNode: any) => {
    if (fnNode.params.length) {
        return fnNode.params[0].name;
    }

    fnNode.params.push(b.indentifier(DEFAULT_WORLD_ID));

    return DEFAULT_WORLD_ID;
}

const ensure_systems_init = (
    program: any,
    config: Config,
): { body: any[], bodyCode: string, world_id: string } => {
    const node = ensure_system_init_fn(config.systemInitFunction, program, config);
    const world_id = ensure_world_id(node);

    const body = node.body.body;

    const bodyCode = recast.print(node).code;
    return {
        body,
        bodyCode,
        world_id,
    };
};

export {
    getDefaultId,
    ensure_systems_import,
    ensure_system_init_fn,
    ensure_world_id,
    ensure_systems_init,
};
