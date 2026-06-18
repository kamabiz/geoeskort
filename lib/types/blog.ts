import type { Locale } from '@/lib/i18n/types';
import type { BlogCategorySlug } from '@/lib/blog-categories';
import { locales } from '@/lib/i18n/config';

export type BlogPostLocaleContent = {
  title: string;
  seoTitle?: string;
  excerpt: string;
  content: string;
  tags: string[];
  focusKeyword?: string;
};

export type BlogPostRecord = {
  slug: string;
  category: BlogCategorySlug;
  publishedAt: string;
  status: 'published' | 'draft';
  coverImage?: string;
  locales: Partial<Record<Locale, BlogPostLocaleContent>>;
};

/** Resolved post for a specific locale (used by pages). */
export type BlogPost = BlogPostLocaleContent & {
  slug: string;
  category: BlogCategorySlug;
  publishedAt: string;
  status: 'published' | 'draft';
  coverImage?: string;
  emoji: string;
  locale: Locale;
  seoTitle: string;
  focusKeyword: string;
  availableLocales: Locale[];
};

export type BlogPostInput = BlogPostRecord;

export function getAvailableLocales(record: BlogPostRecord): Locale[] {
  return locales.filter((locale) => {
    const c = record.locales[locale];
    return !!(c?.title?.trim() && c?.content?.trim());
  });
}

export function hasLocaleContent(record: BlogPostRecord, locale: Locale): boolean {
  return getAvailableLocales(record).includes(locale);
}
