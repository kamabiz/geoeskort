import 'server-only';

import type { BlogArticle } from '@prisma/client';
import type { BlogCategorySlug } from '@/lib/blog-categories';
import { prisma } from '@/lib/prisma';
import type { BlogPostInput, BlogPostRecord } from '@/lib/types/blog';

function rowToRecord(row: BlogArticle): BlogPostRecord {
  return {
    slug: row.slug,
    category: row.category as BlogCategorySlug,
    publishedAt: row.publishedAt,
    status: row.status === 'DRAFT' ? 'draft' : 'published',
    coverImage: row.coverImage ?? undefined,
    title: row.title,
    seoTitle: row.seoTitle || row.title,
    excerpt: row.excerpt,
    content: row.content,
    tags: row.tags,
    focusKeyword: row.focusKeyword || undefined,
  };
}

function recordToData(record: BlogPostInput) {
  return {
    slug: record.slug,
    category: record.category,
    publishedAt: record.publishedAt,
    status: record.status === 'draft' ? ('DRAFT' as const) : ('PUBLISHED' as const),
    coverImage: record.coverImage ?? null,
    title: record.title,
    seoTitle: record.seoTitle || record.title,
    excerpt: record.excerpt,
    content: record.content,
    tags: record.tags,
    focusKeyword: record.focusKeyword || '',
  };
}

export function useBlogDatabase(): boolean {
  return !!process.env.DATABASE_URL;
}

export async function countBlogArticles(): Promise<number> {
  if (!useBlogDatabase()) return 0;
  return prisma.blogArticle.count();
}

export async function getAllBlogRecordsFromDb(includeDrafts = false): Promise<BlogPostRecord[]> {
  const rows = await prisma.blogArticle.findMany({
    where: includeDrafts ? undefined : { status: 'PUBLISHED' },
    orderBy: [{ publishedAt: 'desc' }, { updatedAt: 'desc' }],
  });
  return rows.map(rowToRecord);
}

export async function getBlogRecordBySlugFromDb(slug: string): Promise<BlogPostRecord | undefined> {
  const row = await prisma.blogArticle.findUnique({ where: { slug } });
  return row ? rowToRecord(row) : undefined;
}

export async function createBlogRecordInDb(input: BlogPostInput): Promise<BlogPostRecord> {
  const row = await prisma.blogArticle.create({ data: recordToData(input) });
  return rowToRecord(row);
}

export async function updateBlogRecordInDb(slug: string, input: BlogPostInput): Promise<BlogPostRecord> {
  if (slug !== input.slug) {
    await prisma.blogArticle.delete({ where: { slug } });
    return createBlogRecordInDb(input);
  }
  const row = await prisma.blogArticle.update({
    where: { slug },
    data: recordToData(input),
  });
  return rowToRecord(row);
}

export async function deleteBlogRecordFromDb(slug: string): Promise<void> {
  await prisma.blogArticle.delete({ where: { slug } });
}

export async function importBlogRecordsToDb(records: BlogPostRecord[]): Promise<number> {
  if (records.length === 0) return 0;

  let imported = 0;
  for (const record of records) {
    await prisma.blogArticle.upsert({
      where: { slug: record.slug },
      create: recordToData(record),
      update: recordToData(record),
    });
    imported += 1;
  }
  return imported;
}
