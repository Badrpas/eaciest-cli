const acorn = require('acorn');


const DEFAULT_EXPORT_DECL = 'ExportDefaultDeclaration';
const EXPORT_TYPES = ['ExportNamedDeclaration', DEFAULT_EXPORT_DECL];


const isSystemDeclaration = node => {
  return node.declaration.type === 'ClassDeclaration'
      && node.declaration.superClass?.name === 'System';
}

const getSystemName = node => {
  return node.declaration.id?.name ?? (node.type === DEFAULT_EXPORT_DECL ? 'default' : void 0);
}

/**
 *
 * @param src {string}
 * @param body
 * @param i {number}
 * @returns {any}
 */
const getComment = (src, body, i) => {
  if (i === 0) return '';

  return src.slice(body[i-1].end, body[i].start);
}
const isIgnored = comment => {
  if (!comment) return false;
  const lines = comment.split('\n').filter(x => !!x);
  return lines.length && lines[lines.length - 1].includes('@ignore');
}

module.exports = (src, options = {}) => {
  try {
    const ast = acorn.parse(src, options.acorn);

    const systems = [];

    for (let i = 0; i < ast.body.length; i++) {
      const node = ast.body[i];
      if (!EXPORT_TYPES.includes(node.type)) continue;
      if (!isSystemDeclaration(node)) continue;

      const comment = getComment(src, ast.body, i);
      if (isIgnored(comment)) continue;

      const name = getSystemName(node);
      systems.push({
        name,
        type: 'ClassDeclaration',
      });
    }

    return systems;
  } catch (err) {
    console.error(err);
    return [];
  }
};
