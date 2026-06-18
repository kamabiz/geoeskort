import type { BlogCategorySlug } from '@/lib/blog-categories';

export type BlogPostRecord = {
  slug: string;
  category: BlogCategorySlug;
  publishedAt: string;
  status: 'published' | 'draft';
  coverImage?: string;
  title: string;
  seoTitle?: string;
  excerpt: string;
  content: string;
  tags: string[];
  focusKeyword?: string;
};

/** Resolved post for pages (adds display helpers). */
export type BlogPost = BlogPostRecord & {
  emoji: string;
  seoTitle: string;
  focusKeyword: string;
};

export type BlogPostInput = BlogPostRecord;

export function isValidPost(record: BlogPostRecord): boolean {
  return !!(record.title?.trim() && record.content?.trim());
}
