import { create } from 'zustand';
import type { Lang } from '../lib/i18n';

interface LanguageState {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const savedLang = (typeof localStorage !== 'undefined' ? localStorage.getItem('lang') : null) as Lang | null;

export const useLanguageStore = create<LanguageState>((set) => ({
  lang: savedLang || 'zh',
  setLang: (lang: Lang) => {
    localStorage.setItem('lang', lang);
    set({ lang });
  },
}));
