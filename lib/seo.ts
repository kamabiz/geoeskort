import type { Metadata } from 'next';
import { ogLocales } from '@/lib/i18n/config';
import { absoluteUrl, hreflangAlternates, hreflangAlternatesForLocales } from '@/lib/i18n/paths';
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
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  keywords?: string;
  /** Override hreflang when not all locales have this page (blog posts). */
  hreflangLocales?: Locale[];
};

export function pageMetadata({
  locale,
  path,
  title,
  description,
  ogType = 'website',
  absolute = false,
  publishedTime,
  modifiedTime,
  tags,
  keywords,
  hreflangLocales,
}: PageMeta): Metadata {
  const canonical = absoluteUrl(locale, path);
  const languages = hreflangLocales?.length
    ? hreflangAlternatesForLocales(path, hreflangLocales)
    : hreflangAlternates(path);

  const metadata: Metadata = {
    title: absolute ? { absolute: title } : title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical,
      languages,
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
      ...(ogType === 'article' && publishedTime
        ? { publishedTime, modifiedTime: modifiedTime || publishedTime }
        : {}),
      ...(tags?.length ? { tags } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };

  if (keywords) {
    metadata.keywords = keywords.split(',').map((k) => k.trim()).filter(Boolean);
  }

  return metadata;
}
