const recast = require('recast');
const chalk = require('chalk');

const b = recast.types.builders;

const DEFAULT_WORLD_ID = 'world';


const getDefaultId = importPath => {
  return importPath.replace(/\//g, '_').replace(/\./g, '_');
}

const ensure_systems_import = (node, systems, importPath) => {
  for (const system of systems) {

    const isDefault = system.name === 'default';
    if (isDefault) {
      system.name = getDefaultId(importPath); // WARN mutating the system object
      if (node.specifiers.some(x => x.type === 'ImportDefaultSpecifier')) continue;
    } else {
      if (node.specifiers.some(x => x.imported?.name === system.name)) continue;
    }

    const id = b.identifier(system.name);

    console.log(`Adding import specifier ${chalk.blue(id.name)} from ${chalk.green(importPath)}`);

    const specifier = isDefault ? b.importDefaultSpecifier(id) : b.importSpecifier(id);
    node.specifiers.push(specifier);
  }
}

const ensure_system_init_fn = (exportFnName, program) => {
  for (const node of program.body) {
    if (node.type === 'ExportNamedDeclaration') {
      if (node.declaration?.declarations?.[0]?.id?.name === exportFnName) {
        return node.declaration?.declarations?.[0].init;
      }
    }
  }

  const ast = recast.parse(`
  
  
export const ${exportFnName} = (world) => {

};
`);

  const node = ast.program.body[0];
  program.body.push(node);
  return node.declaration?.declarations?.[0].init;
}

const ensure_world_id = (fnNode) => {
  if (fnNode.params.length) {
    return fnNode.params[0].name;
  }

  fnNode.params.push(b.indentifier(DEFAULT_WORLD_ID));

  return DEFAULT_WORLD_ID;
}

const get_init_node = (name, world_id) => {
  return `${world_id}.addSystemClass(${name});`;
};

const ensure_systems_init = (exportFnName, program, systems) => {
  const node = ensure_system_init_fn(exportFnName, program);
  const world_id = ensure_world_id(node);

  const body = node.body.body;

  const bodyCode = recast.print(node).code;
  for (const { name } of systems) {
    if (bodyCode.includes(name)) {
      continue;
    }
    body.push(get_init_node(name, world_id));
    console.log(`Added ${chalk.blue(name)} initialization`);
  }
};

module.exports = {
  getDefaultId,
  ensure_systems_import,
  ensure_system_init_fn,
  ensure_world_id,
  get_init_node,
  ensure_systems_init,
};
