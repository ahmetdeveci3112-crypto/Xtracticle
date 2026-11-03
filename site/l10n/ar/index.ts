import { TOOLS } from './tools';
import { GUIDES_PAGES } from './guides';
import { proPage } from '../../pro-page';
import { PRO_AR } from './pro';

export const EXTRA_PAGES = [...TOOLS, proPage('ar', PRO_AR), ...GUIDES_PAGES];
