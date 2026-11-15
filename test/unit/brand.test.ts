import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { DARK, FONT_STACK, LIGHT, LOGO_PATH } from '../../src/shared/brand';

const root = path.resolve(__dirname, '../..');
const css = fs.readFileSync(path.join(root, 'src/index.css'), 'utf8');

/** `--name: value;` pairs inside the first `selector { … }` block. */
function vars(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  expect(start, selector).toBeGreaterThanOrEqual(0);
  const body = css.slice(start, css.indexOf('}', start));
  return Object.fromEntries([...body.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([, k, v]) => [k, v.trim()]));
}

describe('brand tokens match src/index.css', () => {
  it('light palette and font stack', () => {
    const root = vars(':root');
    expect(root['font-sans']).toBe(FONT_STACK);
    for (const [k, v] of Object.entries(LIGHT)) expect(root[k], k).toBe(v);
  });
  it('dark palette', () => {
    const dark = vars('.dark');
    for (const [k, v] of Object.entries(DARK)) expect(dark[k], k).toBe(v);
  });
  it('every colour variable in index.css is covered', () => {
    const colours = Object.entries(vars(':root')).filter(([, v]) => v.startsWith('#')).map(([k]) => k);
    expect(Object.keys(LIGHT).sort()).toEqual(colours.sort());
  });
  it('logo glyph is the one the site header draws', () => {
    expect(fs.readFileSync(path.join(root, 'src/App.tsx'), 'utf8')).toContain(LOGO_PATH);
    expect(fs.readFileSync(path.join(root, 'site/render.ts'), 'utf8')).toContain(LOGO_PATH);
  });
});
