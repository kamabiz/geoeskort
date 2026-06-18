import type { Locale } from './types';

export const locales: Locale[] = ['ka', 'en', 'ru', 'tr'];
export const defaultLocale: Locale = 'ka';

export const localeLabels: Record<Locale, string> = {
  ka: 'GE',
  en: 'EN',
  ru: 'RU',
  tr: 'TR',
};

export const ogLocales: Record<Locale, string> = {
  ka: 'ka_GE',
  en: 'en_US',
  ru: 'ru_RU',
  tr: 'tr_TR',
};

export const htmlLang: Record<Locale, string> = {
  ka: 'ka',
  en: 'en',
  ru: 'ru',
  tr: 'tr',
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
