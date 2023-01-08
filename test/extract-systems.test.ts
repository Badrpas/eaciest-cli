import fs from 'fs/promises';
import p from 'path';
import { extract_systems } from "../src/extract-systems";
import { SRC } from './template';

test('System extractor', async function run () {
  const dir = await fs.mkdtemp('extract_systems');
  const filepath = p.resolve(dir, 'extract_systems.ts');
  await fs.writeFile(filepath, SRC);

  const systems = await extract_systems(filepath);

  await fs.rm(dir, { recursive: true });

  const expected = [
    'TopKek',
    'Foo'
  ];

  expect(systems?.map(s => s.name)?.sort()).toEqual(expected.sort());
});

