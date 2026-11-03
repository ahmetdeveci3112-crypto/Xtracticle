import { TOOLS } from './tools';
import { GUIDES_PAGES } from './guides';
import { proPage } from '../../pro-page';
import { PRO_PT } from './pro';

export const EXTRA_PAGES = [...TOOLS, proPage('pt', PRO_PT), ...GUIDES_PAGES];
