import type { BlogCategorySlug } from '@/lib/blog-categories';
import type { Locale } from '@/lib/i18n/types';
import { defaultLocale } from '@/lib/i18n/config';
import type { BlogPostRecord, BlogPostLocaleContent } from '@/lib/types/blog';
import { extractExcerptFromContent } from '@/lib/seo-analyze';

/** Flat single-locale form used by the admin editor. */
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
  /** Which locale block to read/write (defaults to ka). */
  editLocale?: Locale;
};

export function recordPrimaryTitle(record: BlogPostRecord): string {
  const locale = record.locales.ka || record.locales.en || Object.values(record.locales)[0];
  return locale?.title || record.slug;
}

export function recordPrimaryTags(record: BlogPostRecord): string[] {
  const locale = record.locales.ka || record.locales.en || Object.values(record.locales)[0];
  return locale?.tags || [];
}

export function recordToAdminForm(record: BlogPostRecord, locale: Locale = defaultLocale): AdminPostForm {
  const content = record.locales[locale] || record.locales.ka || Object.values(record.locales)[0];

  return {
    slug: record.slug,
    category: record.category,
    publishedAt: record.publishedAt,
    status: record.status,
    coverImage: record.coverImage,
    title: content?.title || '',
    seoTitle: content?.seoTitle || content?.title || '',
    excerpt: content?.excerpt || '',
    content: content?.content || '',
    tags: content?.tags || [],
    focusKeyword: content?.focusKeyword || '',
    editLocale: locale,
  };
}

export function adminFormToRecord(form: AdminPostForm, existing?: BlogPostRecord): BlogPostRecord {
  const locale = form.editLocale || defaultLocale;
  const localeContent: BlogPostLocaleContent = {
    title: form.title.trim(),
    seoTitle: form.seoTitle.trim() || form.title.trim(),
    excerpt: form.excerpt.trim() || extractExcerptFromContent(form.content),
    content: form.content.trim(),
    tags: form.tags,
    focusKeyword: form.focusKeyword.trim(),
  };

  return {
    slug: form.slug.trim(),
    category: form.category,
    publishedAt: form.publishedAt,
    status: form.status,
    coverImage: form.coverImage,
    locales: {
      ...(existing?.locales || {}),
      [locale]: localeContent,
    },
  };
}
