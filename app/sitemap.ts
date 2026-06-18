import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';
import { locales } from '@/lib/i18n/config';
import { absoluteUrl } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';

const staticPaths = ['/', '/blog/', '/contact/', '/privacy/'];

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
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

    for (const post of posts) {
      entries.push({
        url: absoluteUrl(locale, `/blog/${post.slug}/`),
        lastModified: new Date(post.publishedAt),
        changeFrequency: 'monthly',
        priority: 0.8,
      });
    }
  }

  return entries;
}
