import { TOOLS } from './tools';
import { GUIDES_PAGES } from './guides';
import { proPage } from '../../pro-page';
import { PRO_ZH } from './pro';

export const EXTRA_PAGES = [...TOOLS, proPage('zh', PRO_ZH), ...GUIDES_PAGES];
