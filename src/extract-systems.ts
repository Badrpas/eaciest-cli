import fs from 'fs/promises';
import type Parser from "tree-sitter";
import { parser } from "./parser";
import { file_exists } from "./util";

const EXPORT_TYPES = ['export_statement'];

type Node = Parser.SyntaxNode;

const isSystemDeclaration = (node: Node) => {
    const decl = node.children.find(n => n.type === 'class_declaration');
    return decl?.children.some(c => c.type === 'class_heritage' && c.text === 'extends System')
}

const getSystemName = (node: Node) => {
    const decl = node.children.find(n => n.type === 'class_declaration');
    return decl?.children.find(n => n.type === 'type_identifier')?.text;
}

const getComment = (prev_node: Node) => {
    if (prev_node?.type === 'comment') {
        return prev_node.text;
    }
}
const isIgnored = (comment: string) => {
    if (!comment) return false;
    const lines = comment.split('\n').filter(x => !!x);
    return lines.length && lines[lines.length - 1].includes('@ignore');
}

export interface SystemInfo {
    name: string;
    type: 'ClassDeclaration';
}

export const extract_systems = async (path: string): Promise<SystemInfo[]> => {
    const src = (await file_exists(path)) ? await fs.readFile(path, 'utf-8') : '';
    if (src.trim() === '') {
        return [];
    }
    try {
        const ast = parser.parse(src);

        const systems = [];

        for (let i = 0; i < ast.rootNode.children.length; i++) {
            const node = ast.rootNode.children[i];

            if (!EXPORT_TYPES.includes(node.type)) continue;
            if (!isSystemDeclaration(node)) continue;

            const comment = getComment(ast.rootNode.children[i - 1]);
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
