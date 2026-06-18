import type { MetadataRoute } from 'next';
import { getAllRecordsAsync } from '@/lib/blog-store';
import { absoluteUrl } from '@/lib/i18n/paths';

const staticPaths = ['/', '/blog/', '/contact/', '/privacy/'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const records = await getAllRecordsAsync();
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const path of staticPaths) {
    entries.push({
      url: absoluteUrl('ka', path),
      lastModified: now,
      changeFrequency: path === '/' || path === '/blog/' ? 'weekly' : 'yearly',
      priority: path === '/' ? 1 : path === '/blog/' ? 0.9 : 0.4,
    });
  }

  for (const record of records) {
    entries.push({
      url: absoluteUrl('ka', `/blog/${record.slug}/`),
      lastModified: new Date(record.publishedAt),
      changeFrequency: 'monthly',
      priority: 0.8,
    });
  }

  return entries;
}
