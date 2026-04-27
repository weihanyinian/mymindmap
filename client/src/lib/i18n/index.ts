import { createContext, useContext } from 'react';
import zh from './zh';
import en from './en';

export type Translations = typeof zh;
export type Lang = 'zh' | 'en';

const translations: Record<Lang, Translations> = { zh, en };

export function getTranslations(lang: Lang): Translations {
  return translations[lang] || zh;
}

export const LanguageContext = createContext<{
  lang: Lang;
  t: Translations;
  setLang: (lang: Lang) => void;
}>({
  lang: 'zh',
  t: zh,
  setLang: () => {},
});

export function useT(): Translations {
  const { t } = useContext(LanguageContext);
  return t;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
