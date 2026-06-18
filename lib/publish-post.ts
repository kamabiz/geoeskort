import 'server-only';

import crypto from 'crypto';
import { fixLinks } from '@/lib/blog-parse';
import { normalizeLocaleContent } from '@/lib/blog-record';
import { createPost, getRecordBySlugAsync, mergePostLocales } from '@/lib/blog-store';
import { normalizeCategory } from '@/lib/blog-categories';
import { defaultLocale, locales } from '@/lib/i18n/config';
import { extractExcerptFromContent, slugify } from '@/lib/seo-analyze';
import type { BlogPost, BlogPostRecord } from '@/lib/types/blog';
import type { Locale } from '@/lib/i18n/types';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type PublishLocaleContent = {
  title: string;
  excerpt?: string;
  content: string;
  tags?: string[];
  seoTitle?: string;
  focusKeyword?: string;
};

export type PublishPostBody = {
  /** Shared URL slug for all language versions */
  slug?: string;
  category?: string;
  /** Absolute https URL for the card thumbnail and post header image */
  coverImage?: string;
  /** Alias for coverImage (same field) */
  featuredImage?: string;
  status?: string;
  publishedAt?: string;
  /** When true, merge translations into an existing post instead of failing */
  update?: boolean;
  /** Per-locale content — provide ka, en, ru, tr for full multilingual publish */
  translations?: Partial<Record<Locale, PublishLocaleContent>>;
  /** Legacy single-locale fields (treated as Georgian / ka) */
  title?: string;
  content?: string;
  excerpt?: string;
  tags?: string[];
};

export function verifyPublishApiKey(authHeader: string | null): boolean {
  const expected = process.env.BLOG_PUBLISH_API_KEY?.trim();
  if (!expected || !authHeader?.startsWith('Bearer ')) return false;
  const token = authHeader.slice(7).trim();
  if (!token || token.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

function toDateString(iso?: string): string {
  if (!iso) return new Date().toISOString().slice(0, 10);
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) throw new Error('Invalid publishedAt — use an ISO 8601 date string');
  return d.toISOString().slice(0, 10);
}

function normalizeStatus(status?: string): 'published' | 'draft' {
  const s = (status || 'published').toLowerCase();
  if (s !== 'published' && s !== 'draft') {
    throw new Error('status must be "published" or "draft"');
  }
  return s;
}

function normalizeCoverImage(url?: string): string | undefined {
  if (!url?.trim()) return undefined;
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    throw new Error('coverImage must be an absolute http(s) URL');
  }
  return trimmed;
}

function withCoverImage(content: string, coverImage: string | undefined, title: string): string {
  if (!coverImage || content.includes(coverImage)) return content;
  const figure = `<figure class="post-cover"><img src="${coverImage}" alt="${title.replace(/"/g, '&quot;')}" loading="lazy" /></figure>`;
  return `${figure}\n${content}`;
}

function normalizeTranslation(
  raw: PublishLocaleContent,
  coverImage: string | undefined,
): ReturnType<typeof normalizeLocaleContent> {
  let content = fixLinks(raw.content.trim());
  content = withCoverImage(content, coverImage, raw.title.trim());

  const excerpt = raw.excerpt?.trim() || extractExcerptFromContent(content);
  const tags = Array.isArray(raw.tags)
    ? [...new Set(raw.tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean))]
    : [];

  return normalizeLocaleContent({
    title: raw.title,
    seoTitle: raw.seoTitle,
    excerpt,
    content,
    tags,
    focusKeyword: raw.focusKeyword,
  });
}

function resolveSlug(body: PublishPostBody, primaryTitle: string): string {
  let slug = body.slug?.trim().toLowerCase();
  if (!slug) slug = slugify(primaryTitle);
  if (!slug) throw new Error('slug could not be generated — provide a URL-safe slug');
  if (!SLUG_RE.test(slug)) {
    throw new Error('slug must be lowercase letters, numbers, and hyphens only');
  }
  return slug;
}

function collectTranslations(body: PublishPostBody): Partial<Record<Locale, PublishLocaleContent>> {
  const map: Partial<Record<Locale, PublishLocaleContent>> = { ...(body.translations || {}) };

  if (body.title?.trim() && body.content?.trim()) {
    map[defaultLocale] = {
      title: body.title.trim(),
      content: body.content.trim(),
      excerpt: body.excerpt,
      tags: body.tags,
    };
  }

  return map;
}

export function buildPostRecord(body: PublishPostBody): BlogPostRecord {
  const rawTranslations = collectTranslations(body);
  const coverImage = normalizeCoverImage(body.coverImage || body.featuredImage);
  const status = normalizeStatus(body.status);
  const publishedAt = toDateString(body.publishedAt);

  const localesMap: BlogPostRecord['locales'] = {};
  for (const locale of locales) {
    const raw = rawTranslations[locale];
    if (!raw?.title?.trim() || !raw.content?.trim()) continue;
    const normalized = normalizeTranslation(raw, coverImage);
    if (normalized) localesMap[locale] = normalized;
  }

  if (Object.keys(localesMap).length === 0) {
    throw new Error(
      'At least one translation is required — use translations.{ka,en,ru,tr} or legacy title+content fields',
    );
  }

  const primaryLocale =
    (locales.find((l) => localesMap[l]) as Locale | undefined) || defaultLocale;
  const primary = localesMap[primaryLocale]!;
  const slug = resolveSlug(body, primary.title);

  const category = normalizeCategory(body.category, primary.title, primary.content, primary.tags);

  return {
    slug,
    category,
    publishedAt,
    status,
    coverImage,
    locales: localesMap,
  };
}

export async function publishPost(body: PublishPostBody): Promise<BlogPost> {
  const record = buildPostRecord(body);
  const existing = await getRecordBySlugAsync(record.slug);

  let saved: BlogPostRecord;
  if (existing) {
    if (!body.update) {
      throw new Error('A post with this slug already exists — pass "update": true to merge translations');
    }
    saved = await mergePostLocales(record.slug, {
      category: record.category,
      publishedAt: record.publishedAt,
      status: record.status,
      coverImage: record.coverImage,
      locales: record.locales,
    });
  } else {
    saved = await createPost(record);
  }

  const primaryLocale =
    (locales.find((l) => saved.locales[l]) as Locale | undefined) || defaultLocale;
  const { resolvePost } = await import('@/lib/blog-record');
  const post = resolvePost(saved, primaryLocale);
  if (!post) throw new Error('Failed to resolve published post');
  return post;
}
