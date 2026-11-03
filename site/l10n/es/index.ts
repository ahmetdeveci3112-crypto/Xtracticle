import { TOOLS } from './tools';
import { GUIDES_PAGES } from './guides';
import { proPage } from '../../pro-page';
import { PRO_ES } from './pro';

export const EXTRA_PAGES = [...TOOLS, proPage('es', PRO_ES), ...GUIDES_PAGES];
