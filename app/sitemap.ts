import type { MetadataRoute } from 'next';
import { getCommunityPostViewPath } from '@/lib/community/categories';
import { safeCommunity } from '@/lib/community/safe';
import { BLOG_CATEGORY_SLUGS } from '@/lib/blog-categories';
import { getAllRecordsAsync } from '@/lib/blog-store';
import { absoluteUrl } from '@/lib/i18n/paths';
import { prisma } from '@/lib/prisma';

type SitemapPage = {
  path: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;
  priority: number;
};

/** Main public pages for Google recrawl (Georgian URLs, no locale prefix). */
const STATIC_PAGES: SitemapPage[] = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/history/', changeFrequency: 'daily', priority: 0.95 },
  { path: '/questions/', changeFrequency: 'daily', priority: 0.9 },
  { path: '/medical/', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/crush/', changeFrequency: 'daily', priority: 0.9 },
  { path: '/conversationRoom/', changeFrequency: 'daily', priority: 0.85 },
  { path: '/gayChat/', changeFrequency: 'daily', priority: 0.88 },
  { path: '/chat/', changeFrequency: 'daily', priority: 0.85 },
  { path: '/blog/', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/positionVariants/', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/zodiac/', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/leaderboard/', changeFrequency: 'daily', priority: 0.75 },
  { path: '/premium/', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/points/', changeFrequency: 'weekly', priority: 0.65 },
  { path: '/submit/', changeFrequency: 'monthly', priority: 0.65 },
  { path: '/aboutUs/', changeFrequency: 'yearly', priority: 0.5 },
  { path: '/about/', changeFrequency: 'yearly', priority: 0.5 },
  { path: '/rules/', changeFrequency: 'yearly', priority: 0.5 },
  { path: '/contact/', changeFrequency: 'yearly', priority: 0.5 },
  { path: '/privacy/', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/login/', changeFrequency: 'yearly', priority: 0.35 },
  { path: '/register/', changeFrequency: 'yearly', priority: 0.35 },
];

function staticEntry(page: SitemapPage, lastModified = new Date()): MetadataRoute.Sitemap[number] {
  return {
    url: absoluteUrl('ka', page.path),
    lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = STATIC_PAGES.map((page) => staticEntry(page, now));

  for (const category of BLOG_CATEGORY_SLUGS) {
    entries.push(
      staticEntry({
        path: `/blog/category/${category}/`,
        changeFrequency: 'weekly',
        priority: 0.85,
      }),
    );
  }

  try {
    const records = await getAllRecordsAsync();
    for (const record of records) {
      entries.push({
        url: absoluteUrl('ka', `/blog/${record.slug}/`),
        lastModified: new Date(record.publishedAt),
        changeFrequency: 'monthly',
        priority: 0.8,
      });
    }
  } catch {
    // Blog storage unavailable — static URLs still ship.
  }

  const communityPosts = await safeCommunity(
    () =>
      prisma.post.findMany({
        where: { status: 'PUBLISHED' },
        select: { id: true, category: true, slug: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5000,
      }),
    [],
  );

  for (const post of communityPosts) {
    entries.push({
      url: absoluteUrl('ka', getCommunityPostViewPath(post.category, post.slug)),
      lastModified: post.createdAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  }

  return entries;
}
