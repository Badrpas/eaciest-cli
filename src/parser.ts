import Parser from 'tree-sitter';
import { typescript as TypeScript } from 'tree-sitter-typescript';
import * as recast from 'recast';
import * as rtsparser from 'recast/parsers/typescript';
import type { Config } from './config';

const parser = new Parser();
parser.setLanguage(TypeScript);

export { parser }

export const rparse = (src: string, config: Config) => {
    return recast.parse(src, {
        parser: rtsparser,
        ...config.recast.options,
    });
};

