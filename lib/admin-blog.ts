import type { BlogCategorySlug } from '@/lib/blog-categories';
import type { BlogPostRecord } from '@/lib/types/blog';
import { extractExcerptFromContent } from '@/lib/seo-analyze';

export type AdminPostForm = {
  slug: string;
  category: BlogCategorySlug;
  publishedAt: string;
  status: 'published' | 'draft';
  coverImage?: string;
  title: string;
  seoTitle: string;
  excerpt: string;
  content: string;
  tags: string[];
  focusKeyword: string;
};

export function recordPrimaryTitle(record: BlogPostRecord): string {
  return record.title || record.slug;
}

export function recordPrimaryTags(record: BlogPostRecord): string[] {
  return record.tags || [];
}

export function recordToAdminForm(record: BlogPostRecord): AdminPostForm {
  return {
    slug: record.slug,
    category: record.category,
    publishedAt: record.publishedAt,
    status: record.status,
    coverImage: record.coverImage,
    title: record.title,
    seoTitle: record.seoTitle || record.title,
    excerpt: record.excerpt,
    content: record.content,
    tags: record.tags,
    focusKeyword: record.focusKeyword || '',
  };
}

export function adminFormToRecord(form: AdminPostForm): BlogPostRecord {
  return {
    slug: form.slug.trim(),
    category: form.category,
    publishedAt: form.publishedAt,
    status: form.status,
    coverImage: form.coverImage,
    title: form.title.trim(),
    seoTitle: form.seoTitle.trim() || form.title.trim(),
    excerpt: form.excerpt.trim() || extractExcerptFromContent(form.content),
    content: form.content.trim(),
    tags: form.tags,
    focusKeyword: form.focusKeyword.trim(),
  };
}
