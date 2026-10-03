/**
 * The 34-second promo video, per language. Turkish has its own cut; every other
 * language gets the English video with captions in that language.
 */

export type DemoLang = 'en' | 'tr' | 'es' | 'pt' | 'ja' | 'zh' | 'ar';

const CAPTION_LABEL: Record<DemoLang, string> = {
  en: 'English',
  tr: 'Türkçe',
  es: 'Español',
  pt: 'Português',
  ja: '日本語',
  zh: '简体中文',
  ar: 'العربية',
};

export function demoVideo(lang: DemoLang) {
  const base = lang === 'tr' ? 'demo-tr' : 'demo-en';
  return {
    src: `/video/${base}.mp4`,
    poster: `/video/${base}.webp`,
    track: { src: `/video/${base}.${lang}.vtt`, srclang: lang === 'zh' ? 'zh-Hans' : lang, label: CAPTION_LABEL[lang] },
  };
}
