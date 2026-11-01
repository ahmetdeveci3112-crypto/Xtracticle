/**
 * Ways to support Xtracticle. Every entry stays hidden until it is filled in,
 * so the site never links to a page that does not exist yet.
 */
export const SUPPORT = {
  /** buymeacoffee.com username, e.g. 'xtracticle'. */
  coffee: 'ahmetdeveci',
  /** GitHub username with Sponsors enabled. */
  sponsors: '',
};

export const coffeeUrl = (source: string) =>
  SUPPORT.coffee ? `https://buymeacoffee.com/${SUPPORT.coffee}?utm_source=${source}&utm_medium=tip` : '';

export const sponsorsUrl = () => (SUPPORT.sponsors ? `https://github.com/sponsors/${SUPPORT.sponsors}` : '');
