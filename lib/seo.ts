import type { Metadata } from 'next';
import { ogLocales } from '@/lib/i18n/config';
import { absoluteUrl, hreflangAlternates } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';
import { SITE_NAME } from './site';

type PageMeta = {
  locale: Locale;
  /** Path without locale prefix, e.g. /blog/ or /contact/ */
  path: string;
  title: string;
  description: string;
  ogType?: 'website' | 'article';
  absolute?: boolean;
};

export function pageMetadata({
  locale,
  path,
  title,
  description,
  ogType = 'website',
  absolute = false,
}: PageMeta): Metadata {
  const canonical = absoluteUrl(locale, path);

  return {
    title: absolute ? { absolute: title } : title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical,
      languages: hreflangAlternates(path),
    },
    openGraph: {
      type: ogType,
      url: canonical,
      title,
      description,
      siteName: SITE_NAME,
      locale: ogLocales[locale],
      alternateLocale: (Object.keys(ogLocales) as Locale[])
        .filter((l) => l !== locale)
        .map((l) => ogLocales[l]),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}
