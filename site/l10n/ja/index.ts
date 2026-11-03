import { TOOLS } from './tools';
import { GUIDES_PAGES } from './guides';
import { proPage } from '../../pro-page';
import { PRO_JA } from './pro';

export const EXTRA_PAGES = [...TOOLS, proPage('ja', PRO_JA), ...GUIDES_PAGES];
