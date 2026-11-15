/**
 * Brand tokens shared by the site and the browser extension (docs/chrome-extension-plan.md, A6).
 *
 * The site's source of truth is the CSS custom properties in src/index.css (`:root` and `.dark`);
 * these values must stay identical (test/unit/brand.test.ts compares them). The extension's
 * Shadow DOM widgets and popup use only these tokens.
 */

export const FONT_STACK = "'Inter', system-ui, -apple-system, sans-serif";

/** Keys are the CSS variable names without the leading `--`. */
export const LIGHT = {
  'bg-primary': '#fafafa',
  'bg-secondary': '#ffffff',
  'bg-tertiary': '#f5f5f5',
  'text-primary': '#0a0a0a',
  'text-secondary': '#525252',
  'text-tertiary': '#737373',
  border: '#e5e5e5',
  'border-subtle': '#f0f0f0',
  accent: '#0a0a0a',
  'accent-hover': '#262626',
  'error-bg': '#fef2f2',
  'error-text': '#dc2626',
  'error-border': '#fecaca',
} as const;

export type ColorToken = keyof typeof LIGHT;

export const DARK: Record<ColorToken, string> = {
  'bg-primary': '#0a0a0a',
  'bg-secondary': '#141414',
  'bg-tertiary': '#1c1c1c',
  'text-primary': '#fafafa',
  'text-secondary': '#a3a3a3',
  'text-tertiary': '#737373',
  border: '#262626',
  'border-subtle': '#1c1c1c',
  accent: '#fafafa',
  'accent-hover': '#d4d4d4',
  'error-bg': '#1c0a0a',
  'error-text': '#f87171',
  'error-border': '#451a1a',
};

/** Corner radii used by the site's components (src/index.css: .xt-logo / cards 1rem, inputs .75rem, pills 999px). */
export const RADIUS = { sm: '0.6rem', md: '0.75rem', lg: '1rem', pill: '999px' } as const;

/** The site logo glyph (src/App.tsx and site/render.ts header), drawn on an `accent` square with `bg-primary` fill. */
export const LOGO_PATH =
  'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.007 4.076H5.036z';

export const logoSvg = (size = 28) =>
  `<svg viewBox="0 0 24 24" aria-hidden="true" width="${size}" height="${size}" fill="currentColor"><path d="${LOGO_PATH}"></path></svg>`;

/**
 * Xtracticle's own mark (docs/brand/): a page with a dog-eared corner and a bookmark notch, i.e. a
 * post kept as a document. 24-unit grid, same convention as LOGO_PATH (fill=currentColor on an
 * `accent` tile). Used for the extension icons; the site still draws LOGO_PATH until the owner switches.
 */
export const MARK_PATH = 'M5 4.24a2.24 2.24 0 0 1 2.24 -2.24H13.68L19 7.32V22L12 16.8L5 22Z';

export const MARK_SVG = (size = 28) =>
  `<svg viewBox="0 0 24 24" aria-hidden="true" width="${size}" height="${size}" fill="currentColor"><path d="${MARK_PATH}"></path></svg>`;

/** CSS custom properties for a Shadow DOM root or the popup, e.g. `:host { ${cssVars(LIGHT)} }`. */
export const cssVars = (palette: Record<ColorToken, string>) =>
  [`--font-sans: ${FONT_STACK};`, ...Object.entries(palette).map(([k, v]) => `--${k}: ${v};`)].join(' ');
