import type { MetadataRoute } from 'next';
import { getAllRecordsAsync } from '@/lib/blog-store';
import { locales } from '@/lib/i18n/config';
import { absoluteUrl } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';
import { getAvailableLocales } from '@/lib/types/blog';

const staticPaths = ['/', '/blog/', '/contact/', '/privacy/'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const records = await getAllRecordsAsync();
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales as Locale[]) {
    for (const path of staticPaths) {
      entries.push({
        url: absoluteUrl(locale, path),
        lastModified: now,
        changeFrequency: path === '/' || path === '/blog/' ? 'weekly' : 'yearly',
        priority: path === '/' ? 1 : path === '/blog/' ? 0.9 : 0.4,
      });
    }

    for (const record of records) {
      if (!getAvailableLocales(record).includes(locale)) continue;
      entries.push({
        url: absoluteUrl(locale, `/blog/${record.slug}/`),
        lastModified: new Date(record.publishedAt),
        changeFrequency: 'monthly',
        priority: 0.8,
      });
    }
  }

  return entries;
}
