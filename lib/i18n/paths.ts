import { SITE_URL } from '@/lib/site';
import type { Locale } from './types';
import { defaultLocale } from './config';

/** Path segment after locale, always starts with / and uses trailing slash for pages */
export function normalizePath(path: string): string {
  if (!path || path === '/') return '/';
  let p = path.startsWith('/') ? path : `/${path}`;
  if (!p.endsWith('/')) p += '/';
  return p;
}

/** Public URL path for a locale (ka has no prefix) */
export function localePath(locale: Locale, path: string = '/'): string {
  const p = normalizePath(path);
  if (locale === defaultLocale) return p === '/' ? '/' : p;
  return p === '/' ? `/${locale}/` : `/${locale}${p}`;
}

export function absoluteUrl(locale: Locale, path: string = '/'): string {
  const p = localePath(locale, path);
  return `${SITE_URL}${p === '/' ? '/' : p}`;
}

/** hreflang map for all locales + x-default */
export function hreflangAlternates(path: string = '/'): Record<string, string> {
  return hreflangAlternatesForLocales(path, ['ka', 'en', 'ru', 'tr'] as Locale[]);
}

/** hreflang for pages that exist only in specific locales (e.g. blog posts). */
export function hreflangAlternatesForLocales(
  path: string,
  availableLocales: Locale[],
): Record<string, string> {
  const langs: Record<string, string> = {};
  const hasDefault = availableLocales.includes(defaultLocale);

  if (hasDefault) {
    langs['x-default'] = absoluteUrl(defaultLocale, path);
  } else if (availableLocales[0]) {
    langs['x-default'] = absoluteUrl(availableLocales[0], path);
  }

  for (const locale of availableLocales) {
    langs[locale] = absoluteUrl(locale, path);
  }

  return langs;
}

/** Strip locale prefix from pathname → inner path e.g. /blog/ */
export function stripLocaleFromPath(pathname: string): string {
  const clean = pathname.replace(/\/$/, '') || '/';
  for (const locale of ['en', 'ru', 'tr'] as Locale[]) {
    if (clean === `/${locale}`) return '/';
    if (clean.startsWith(`/${locale}/`)) {
      const rest = clean.slice(locale.length + 1) || '/';
      return normalizePath(rest);
    }
  }
  return normalizePath(clean);
}

export function localeFromPath(pathname: string): Locale {
  const clean = pathname.replace(/\/$/, '') || '/';
  if (clean.startsWith('/en')) return 'en';
  if (clean.startsWith('/ru')) return 'ru';
  if (clean.startsWith('/tr')) return 'tr';
  return 'ka';
}

/** Switch current path to another locale */
export function switchLocalePath(pathname: string, target: Locale): string {
  const inner = stripLocaleFromPath(pathname);
  return localePath(target, inner);
}
