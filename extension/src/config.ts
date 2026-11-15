/// <reference path="./env.d.ts" />
import { originOf } from '../../src/shared/bridge';

/**
 * Site the extension talks to: https://xtracticle.com in the store build, the test server in the dev build
 * (extension/build.mjs). The version is the manifest's (extension/manifest.json is the one source).
 * Outside a build (unit tests) the defines are missing and the production values apply.
 */
export const XT_BASE: string = typeof __XT_BASE__ === 'string' ? __XT_BASE__ : 'https://xtracticle.com';
export const XT_ORIGIN: string = originOf(XT_BASE) || 'https://xtracticle.com';
export const XT_VERSION: string = typeof __XT_VERSION__ === 'string' ? __XT_VERSION__ : '0.0.0';
