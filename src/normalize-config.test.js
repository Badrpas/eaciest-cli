const normalizeConfig = require('./normalize-config');

describe(`Normalize Config`, () => {
  it(`should return same values after on already normalized config`, () => {
    const config = {

    };
    const normalized = normalizeConfig(config);

    expect(normalizeConfig(normalized)).toEqual(normalized);

  });

  it(`should consider absolute values`, () => {
    const config = {
      src: '/top/kek',
      glob: '/a/b/**/qwe.js',
      systemsSetupFile: '/foo/bar/baz.js',
    };

    const normalized = normalizeConfig(config);

    expect(normalized.src).toBe('/top/kek');
    expect(normalized.glob).toBe('/a/b/**/qwe.js');
    expect(normalized.systemsSetupFile).toBe('/foo/bar/baz.js');
  });
});
