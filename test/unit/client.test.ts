import { describe, expect, it } from 'vitest';
import { appClient, isAppClient } from '../../src/shared/client';

const req = (value?: string) => new Request('https://xtracticle.com/api/x', value === undefined ? {} : { headers: { 'X-Xt-Client': value } });

describe('isAppClient', () => {
  it('accepts the site and the extension', () => {
    expect(isAppClient(req('web'))).toBe(true);
    expect(isAppClient(req('ext'))).toBe(true);
    expect(appClient(req('web'))).toBe('web');
    expect(appClient(req('ext'))).toBe('ext');
  });
  it('rejects a missing, empty or unknown header', () => {
    expect(isAppClient(req())).toBe(false);
    expect(isAppClient(req(''))).toBe(false);
    expect(isAppClient(req('WEB'))).toBe(false);
    expect(isAppClient(req('web,ext'))).toBe(false);
    expect(isAppClient(req('mcp'))).toBe(false);
    expect(appClient(req('other'))).toBeNull();
  });
});
