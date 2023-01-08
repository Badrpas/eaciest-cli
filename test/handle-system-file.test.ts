import { resolve, dirname } from 'path';
import { readFile, writeFile, mkdir, rm } from 'fs/promises';
import { Config, DEFAULT_CONFIG } from '../src';
import { handleSystemFile } from "../src/handle-system-file";
import { SRC, template } from './template';


test('sequential systems', async () => {
    const path1 = resolve(process.cwd(), 'tmp/tmp1.ts');
    const path2 = resolve(process.cwd(), 'tmp/tmp2.ts');
    const tmp_dir = dirname(path1);
    await mkdir(tmp_dir, { recursive: true });

    try {
        await writeFile(path1, template('Foo', 'Bar'));
        const config: Config = {
            ...DEFAULT_CONFIG,
            systemAggregationFile: resolve(tmp_dir, 'init-systems.ts'),
            useTs: true,
            silent: true,
        };
        await handleSystemFile(path1, config);
        const out1 = await readFile(config.systemAggregationFile, 'utf-8');

        expect(out1).toContain('world.addSystemClass(Foo);');
        expect(out1).toContain('world.addSystemClass(Bar);');
        expect(out1).not.toContain('world.addSystemClass(Top);');
        expect(out1).not.toContain('world.addSystemClass(Kek);');

        await writeFile(path2, template('Top', 'Kek'));
        await handleSystemFile(path2, config);
        const out2 = await readFile(config.systemAggregationFile, 'utf-8');

        expect(out2).toContain('world.addSystemClass(Top);');
        expect(out2).toContain('world.addSystemClass(Kek);');
    } catch (e) {
        console.error('anerr:', e);
    } finally {
        await rm(tmp_dir, {
            recursive: true,
        });
    }
});

test('run_parallel', async () => {
    const path1 = resolve(process.cwd(), 'tmp/tmp1.ts');
    const path2 = resolve(process.cwd(), 'tmp/tmp2.ts');
    const tmp_dir = dirname(path1);
    await mkdir(tmp_dir, { recursive: true });

    const config: Config = {
        ...DEFAULT_CONFIG,
        systemAggregationFile: resolve(tmp_dir, 'init-systems.ts'),
        useTs: true,
        silent: true,
    };
    try {
        await writeFile(path1, template('Foo', 'Bar'));
        await writeFile(path2, template('Top', 'Kek'));
        await Promise.all([
            handleSystemFile(path1, config),
            handleSystemFile(path2, config),
        ]);
        const out = await readFile(config.systemAggregationFile, 'utf-8');
        expect(out).toContain('world.addSystemClass(Foo);');
        expect(out).toContain('world.addSystemClass(Bar);');
        expect(out).toContain('world.addSystemClass(Top);');
        expect(out).toContain('world.addSystemClass(Kek);');
    } catch (e) {
        console.error('anerr:', e);
    } finally {
        await rm(tmp_dir, {
            recursive: true,
        });
    }
});



