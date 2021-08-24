const recast = require('recast');
const { ensure_systems_init, ensure_systems_import } = require('./ensure');


module.exports = ({ src, importPath, systems = [], exportFnName, ...options } = {}) => {
  const ast = recast.parse(src);

  let importNode = null;
  for (let i = 0; i < ast.program.body.length; i++) {
    const node = ast.program.body[i];
    if (node.type !== 'ImportDeclaration') continue;
    if (node.source.value !== importPath) continue;
    importNode = node;
    break;
  }

  if (!importNode) {
    const importAst = recast.parse(`import {} from '${importPath}';\n`);
    ast.program.body.unshift(importNode = importAst.program.body[0]);
  }

  ensure_systems_import(importNode, systems, importPath);
  ensure_systems_init(exportFnName, ast.program, systems);

  return recast.print(ast).code;
};
