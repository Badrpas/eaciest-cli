import { isAbsolute, resolve, extname } from 'path';
import type { Options } from "recast";

export interface Config {
    glob: string;
    systemAggregationFile: string;
    systemInitFunction: string;
    useTs: boolean;
    silent: boolean,
    recast: {
        options: Partial<Options>,
    },
}

export type ConfigPartial = Partial<Config>;


export const DEFAULT_CONFIG = Object.freeze<Config>({
    glob: "src/**/systems/**.js",
    systemAggregationFile: "src/init-systems.js",
    systemInitFunction: "initSystems",
    useTs: false,
    silent: false,
    recast: {
        options: {
            quote: 'single',
            tabWidth: 2,
            trailingComma: true,
        },
    },
});

export const normalize = (config_part: ConfigPartial): Config => {
    const c = {
        ...DEFAULT_CONFIG,
        ...config_part,
        recast: {
            ...DEFAULT_CONFIG.recast,
            ...(config_part.recast || {}),
            options: {
                ...DEFAULT_CONFIG.recast.options,
                ...(config_part.recast?.options || {}),

            },
        },
    };

    if (!isAbsolute(c.glob)) {
        c.glob = resolve(process.cwd(), c.glob);
    }

    if (!isAbsolute(c.systemAggregationFile)) {
        c.systemAggregationFile = resolve(process.cwd(), c.systemAggregationFile);
    }

    if (typeof config_part.useTs === 'undefined') {
        c.useTs = extname(c.systemAggregationFile) === '.ts';
    }

    return c;
};


