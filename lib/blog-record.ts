import {
  getCategoryEmoji,
  normalizeCategory,
} from '@/lib/blog-categories';
import { parseMarkdown, fixLinks } from '@/lib/blog-parse';
import type { BlogPost, BlogPostRecord } from '@/lib/types/blog';
import { isValidPost } from '@/lib/types/blog';

type ContentFields = Pick<
  BlogPostRecord,
  'title' | 'seoTitle' | 'excerpt' | 'content' | 'tags' | 'focusKeyword'
>;

export function emptyPostContent(): ContentFields {
  return {
    title: '',
    excerpt: '',
    content: '',
    tags: [],
    focusKeyword: '',
  };
}

export function normalizePostContent(raw: unknown): ContentFields | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const title = String(o.title || '').trim();
  const content = String(o.content || '').trim();
  if (!title || !content) return null;

  const tags = Array.isArray(o.tags)
    ? [...new Set(o.tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean))]
    : [];

  const excerpt =
    String(o.excerpt || '').trim() ||
    content
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 155);

  return {
    title,
    seoTitle: String(o.seoTitle || o.title || '').trim() || title,
    excerpt,
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

/** Read Georgian content from flat JSON or legacy `locales.ka` / `translations.ka`. */
function extractGeorgianContent(data: Record<string, unknown>): ContentFields | null {
  const flat = normalizePostContent({
    title: data.title,
    content: data.content,
    excerpt: data.excerpt,
    tags: data.tags,
    seoTitle: data.seoTitle,
    focusKeyword: data.focusKeyword,
  });
  if (flat) return flat;

  for (const key of ['locales', 'translations'] as const) {
    const map = data[key];
    if (!map || typeof map !== 'object') continue;
    const ka = (map as Record<string, unknown>).ka;
    const migrated = normalizePostContent(ka);
    if (migrated) return migrated;
  }

  return null;
}

function buildRecord(
  slug: string,
  data: Record<string, unknown>,
  content: ContentFields,
): BlogPostRecord {
  const category = normalizeCategory(
    String(data.category || ''),
    content.title,
    content.content,
    content.tags,
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
    ...content,
  };
}

export function parseJsonRecord(raw: string, filename?: string): BlogPostRecord | null {
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    const slug = String(data.slug || filename?.replace(/\.json$/i, '') || '').trim();
    if (!slug) return null;

    const content = extractGeorgianContent(data);
    if (!content) return null;

    return buildRecord(slug, data, content);
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
    title: post.title,
    seoTitle: post.seoTitle,
    excerpt: post.excerpt,
    content: post.content,
    tags: post.tags,
    focusKeyword: post.focusKeyword,
  };
}

export function parseStoredContent(raw: string, filename: string): BlogPostRecord | null {
  if (filename.endsWith('.json')) return parseJsonRecord(raw, filename);
  if (filename.endsWith('.md')) return legacyMarkdownToRecord(raw, filename);
  return null;
}

export function serializeRecord(record: BlogPostRecord): string {
  const { slug, category, publishedAt, status, coverImage, title, seoTitle, excerpt, content, tags, focusKeyword } =
    record;

  return `${JSON.stringify(
    {
      slug,
      category,
      publishedAt,
      status,
      ...(coverImage ? { coverImage } : {}),
      title,
      seoTitle: seoTitle || title,
      excerpt,
      content,
      tags,
      ...(focusKeyword ? { focusKeyword } : {}),
    },
    null,
    2,
  )}\n`;
}

export function resolvePost(record: BlogPostRecord): BlogPost | null {
  if (!isValidPost(record)) return null;

  const coverImage =
    record.coverImage ||
    extractCoverFromContent(record.content);

  return {
    ...record,
    coverImage,
    emoji: getCategoryEmoji(record.category),
    seoTitle: record.seoTitle || record.title,
    focusKeyword: record.focusKeyword || '',
  };
}

function extractCoverFromContent(content: string): string | undefined {
  const figureMatch = content.match(/<figure[^>]*class="[^"]*post-cover[^"]*"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"/i);
  if (figureMatch?.[1]) return figureMatch[1];
  const imgMatch = content.match(/<img[^>]+src="(https?:\/\/[^"]+)"/i);
  return imgMatch?.[1];
}

export { normalizePostContent as normalizeLocaleContent };
