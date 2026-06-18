import type { Locale } from '@/lib/i18n/types';
import { locales } from '@/lib/i18n/config';
import {
  getCategoryEmoji,
  normalizeCategory,
} from '@/lib/blog-categories';
import { parseMarkdown, fixLinks } from '@/lib/blog-parse';
import type {
  BlogPost,
  BlogPostLocaleContent,
  BlogPostRecord,
} from '@/lib/types/blog';
import { getAvailableLocales } from '@/lib/types/blog';

function emptyLocaleContent(): BlogPostLocaleContent {
  return {
    title: '',
    excerpt: '',
    content: '',
    tags: [],
    focusKeyword: '',
  };
}

function normalizeLocaleContent(raw: unknown): BlogPostLocaleContent | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const title = String(o.title || '').trim();
  const content = String(o.content || '').trim();
  if (!title || !content) return null;

  const tags = Array.isArray(o.tags)
    ? [...new Set(o.tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean))]
    : [];

  return {
    title,
    seoTitle: String(o.seoTitle || o.title || '').trim() || title,
    excerpt: String(o.excerpt || '').trim(),
    content: fixLinks(content),
    tags,
    focusKeyword: String(o.focusKeyword || '').trim(),
  };
}

function normalizeCoverImageField(raw: unknown): string | undefined {
  const url = String(raw || '').trim();
  if (!url || !/^https?:\/\//i.test(url)) return undefined;
  return url;
}

function extractLocalesMap(data: Record<string, unknown>): Partial<Record<Locale, BlogPostLocaleContent>> {
  const localesMap: Partial<Record<Locale, BlogPostLocaleContent>> = {};

  const sources = [data.locales, data.translations];
  for (const rawLocales of sources) {
    if (!rawLocales || typeof rawLocales !== 'object') continue;
    const map = rawLocales as Record<string, unknown>;
    for (const locale of locales) {
      if (localesMap[locale]) continue;
      const content = normalizeLocaleContent(map[locale]);
      if (content) {
        if (!content.excerpt) {
          content.excerpt = content.content
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 155);
        }
        localesMap[locale] = content;
      }
    }
  }

  if (Object.keys(localesMap).length === 0) {
    const legacy = normalizeLocaleContent({
      title: data.title,
      content: data.content,
      excerpt: data.excerpt,
      tags: data.tags,
      seoTitle: data.seoTitle,
      focusKeyword: data.focusKeyword,
    });
    if (legacy) {
      if (!legacy.excerpt) {
        legacy.excerpt = legacy.content
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 155);
      }
      localesMap.ka = legacy;
    }
  }

  return localesMap;
}

export function parseJsonRecord(raw: string, filename?: string): BlogPostRecord | null {
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    const slug = String(data.slug || filename?.replace(/\.json$/i, '') || '').trim();
    if (!slug) return null;

    const localesMap = extractLocalesMap(data);

    if (Object.keys(localesMap).length === 0) return null;

    const firstLocale = (getAvailableLocales({
      slug,
      category: 'travel',
      publishedAt: '',
      status: 'published',
      locales: localesMap,
    })[0] || 'ka') as Locale;
    const first = localesMap[firstLocale]!;

    const category = normalizeCategory(
      String(data.category || ''),
      first.title,
      first.content,
      first.tags,
    );

    const statusRaw = String(data.status || 'published').toLowerCase();
    const status = statusRaw === 'draft' ? 'draft' : 'published';

    const coverImage =
      normalizeCoverImageField(data.coverImage) ||
      normalizeCoverImageField(data.featuredImage);

    return {
      slug,
      category,
      publishedAt: String(data.publishedAt || new Date().toISOString().slice(0, 10)),
      status,
      coverImage,
      locales: localesMap,
    };
  } catch {
    return null;
  }
}

export function legacyMarkdownToRecord(raw: string, filename?: string): BlogPostRecord | null {
  const post = parseMarkdown(raw, filename);
  if (!post) return null;

  return {
    slug: post.slug,
    category: post.category,
    publishedAt: post.publishedAt,
    status: post.status,
    coverImage: post.coverImage,
    locales: {
      ka: {
        title: post.title,
        seoTitle: post.seoTitle,
        excerpt: post.excerpt,
        content: post.content,
        tags: post.tags,
        focusKeyword: post.focusKeyword,
      },
    },
  };
}

export function parseStoredContent(raw: string, filename: string): BlogPostRecord | null {
  if (filename.endsWith('.json')) return parseJsonRecord(raw, filename);
  if (filename.endsWith('.md')) return legacyMarkdownToRecord(raw, filename);
  return null;
}

export function serializeRecord(record: BlogPostRecord): string {
  return `${JSON.stringify(record, null, 2)}\n`;
}

export function resolvePost(record: BlogPostRecord, locale: Locale): BlogPost | null {
  const content = record.locales[locale];
  if (!content?.title?.trim() || !content.content?.trim()) return null;

  const availableLocales = getAvailableLocales(record);
  const coverImage =
    record.coverImage ||
    extractCoverFromContent(content.content) ||
    extractCoverFromRecord(record);

  return {
    ...content,
    slug: record.slug,
    category: record.category,
    publishedAt: record.publishedAt,
    status: record.status,
    coverImage,
    emoji: getCategoryEmoji(record.category),
    locale,
    seoTitle: content.seoTitle || content.title,
    focusKeyword: content.focusKeyword || '',
    availableLocales,
  };
}

export function mergeLocaleIntoRecord(
  record: BlogPostRecord,
  locale: Locale,
  content: BlogPostLocaleContent,
): BlogPostRecord {
  return {
    ...record,
    locales: {
      ...record.locales,
      [locale]: content,
    },
  };
}

export function recordFromSingleLocale(
  slug: string,
  category: BlogPostRecord['category'],
  publishedAt: string,
  status: BlogPostRecord['status'],
  coverImage: string | undefined,
  locale: Locale,
  content: BlogPostLocaleContent,
): BlogPostRecord {
  return {
    slug,
    category,
    publishedAt,
    status,
    coverImage,
    locales: { [locale]: content },
  };
}

export { emptyLocaleContent, normalizeLocaleContent };

function extractCoverFromContent(content: string): string | undefined {
  const figureMatch = content.match(/<figure[^>]*class="[^"]*post-cover[^"]*"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"/i);
  if (figureMatch?.[1]) return figureMatch[1];
  const imgMatch = content.match(/<img[^>]+src="(https?:\/\/[^"]+)"/i);
  return imgMatch?.[1];
}

function extractCoverFromRecord(record: BlogPostRecord): string | undefined {
  for (const locale of locales) {
    const content = record.locales[locale]?.content;
    if (!content) continue;
    const cover = extractCoverFromContent(content);
    if (cover) return cover;
  }
  return undefined;
}
