import 'server-only';

import crypto from 'crypto';
import { fixLinks } from '@/lib/blog-parse';
import { normalizePostContent } from '@/lib/blog-record';
import { createPost, getRecordBySlugAsync, updatePost } from '@/lib/blog-store';
import { normalizeCategory } from '@/lib/blog-categories';
import { extractExcerptFromContent, slugify } from '@/lib/seo-analyze';
import type { BlogPost, BlogPostRecord } from '@/lib/types/blog';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type PublishPostBody = {
  slug?: string;
  category?: string;
  coverImage?: string;
  featuredImage?: string;
  status?: string;
  publishedAt?: string;
  /** When true, update an existing post instead of failing */
  update?: boolean;
  title?: string;
  content?: string;
  excerpt?: string;
  tags?: string[];
  seoTitle?: string;
  focusKeyword?: string;
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

function resolveSlug(body: PublishPostBody, primaryTitle: string): string {
  let slug = body.slug?.trim().toLowerCase();
  if (!slug) slug = slugify(primaryTitle);
  if (!slug) throw new Error('slug could not be generated — provide a URL-safe slug');
  if (!SLUG_RE.test(slug)) {
    throw new Error('slug must be lowercase letters, numbers, and hyphens only');
  }
  return slug;
}

export function buildPostRecord(body: PublishPostBody): BlogPostRecord {
  if (!body.title?.trim() || !body.content?.trim()) {
    throw new Error('title and content are required (Georgian)');
  }

  const coverImage = normalizeCoverImage(body.coverImage || body.featuredImage);
  const status = normalizeStatus(body.status);
  const publishedAt = toDateString(body.publishedAt);

  let content = fixLinks(body.content.trim());
  content = withCoverImage(content, coverImage, body.title.trim());

  const excerpt = body.excerpt?.trim() || extractExcerptFromContent(content);
  const tags = Array.isArray(body.tags)
    ? [...new Set(body.tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean))]
    : [];

  const normalized = normalizePostContent({
    title: body.title,
    seoTitle: body.seoTitle,
    excerpt,
    content,
    tags,
    focusKeyword: body.focusKeyword,
  });

  if (!normalized) {
    throw new Error('Invalid post content');
  }

  const slug = resolveSlug(body, normalized.title);
  const category = normalizeCategory(body.category, normalized.title, normalized.content, normalized.tags);

  return {
    slug,
    category,
    publishedAt,
    status,
    coverImage,
    ...normalized,
  };
}

export async function publishPost(body: PublishPostBody): Promise<BlogPost> {
  const record = buildPostRecord(body);
  const existing = await getRecordBySlugAsync(record.slug);

  let saved: BlogPostRecord;
  if (existing) {
    if (!body.update) {
      throw new Error('A post with this slug already exists — pass "update": true to replace it');
    }
    saved = await updatePost(record.slug, record);
  } else {
    saved = await createPost(record);
  }

  const { resolvePost } = await import('@/lib/blog-record');
  const post = resolvePost(saved);
  if (!post) throw new Error('Failed to resolve published post');
  return post;
}
