import { originOf } from '../../src/shared/bridge';

/** Site the extension talks to: https://xtracticle.com in the store build, http://localhost:8787 in the dev build (extension/build.mjs). */
export const XT_BASE: string = __XT_BASE__;
export const XT_ORIGIN: string = originOf(XT_BASE) || 'https://xtracticle.com';
export const XT_VERSION: string = __XT_VERSION__;
