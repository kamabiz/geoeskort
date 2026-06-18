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

/** Public URL path (Georgian only — no locale prefix) */
export function localePath(_locale: Locale, path: string = '/'): string {
  const p = normalizePath(path);
  return p === '/' ? '/' : p;
}

export function absoluteUrl(_locale: Locale, path: string = '/'): string {
  const p = localePath(defaultLocale, path);
  return `${SITE_URL}${p === '/' ? '/' : p}`;
}

/** hreflang map — Georgian only */
export function hreflangAlternates(path: string = '/'): Record<string, string> {
  return hreflangAlternatesForLocales(path, [defaultLocale]);
}

export function hreflangAlternatesForLocales(
  path: string,
  availableLocales: Locale[],
): Record<string, string> {
  const langs: Record<string, string> = {};
  const primary = availableLocales.includes(defaultLocale)
    ? defaultLocale
    : availableLocales[0] || defaultLocale;

  langs['x-default'] = absoluteUrl(primary, path);
  langs.ka = absoluteUrl(defaultLocale, path);

  return langs;
}

/** Strip legacy /en/, /ru/, /tr/ prefix from pathname */
export function stripLocaleFromPath(pathname: string): string {
  const clean = pathname.replace(/\/$/, '') || '/';
  for (const legacy of ['en', 'ru', 'tr']) {
    if (clean === `/${legacy}`) return '/';
    if (clean.startsWith(`/${legacy}/`)) {
      const rest = clean.slice(legacy.length + 1) || '/';
      return normalizePath(rest);
    }
  }
  if (clean === '/ka') return '/';
  if (clean.startsWith('/ka/')) {
    return normalizePath(clean.slice(3) || '/');
  }
  return normalizePath(clean);
}

export function localeFromPath(_pathname: string): Locale {
  return defaultLocale;
}

export function switchLocalePath(pathname: string, _target: Locale): string {
  return stripLocaleFromPath(pathname);
}
