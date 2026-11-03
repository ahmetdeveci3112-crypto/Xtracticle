import { TOOLS } from './tools';
import { GUIDES_PAGES } from './guides';
import { proPage } from '../../pro-page';
import { PRO_TR } from './pro';

export const EXTRA_PAGES = [...TOOLS, proPage('tr', PRO_TR), ...GUIDES_PAGES];
