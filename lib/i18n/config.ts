import type { Locale } from './types';

export const locales: Locale[] = ['ka'];
export const defaultLocale: Locale = 'ka';

/** Legacy locale URL prefixes — redirected to Georgian paths */
export const legacyLocalePrefixes = ['en', 'ru', 'tr'] as const;

export const ogLocales: Record<Locale, string> = {
  ka: 'ka_GE',
};

export const htmlLang: Record<Locale, string> = {
  ka: 'ka',
};

export function isLocale(value: string): value is Locale {
  return value === 'ka';
}

export function isLegacyLocalePrefix(value: string): boolean {
  return (legacyLocalePrefixes as readonly string[]).includes(value);
}
