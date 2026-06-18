import 'server-only';

import crypto from 'crypto';
import { fixLinks } from '@/lib/blog-parse';
import { createPost } from '@/lib/blog-store';
import { extractExcerptFromContent, slugify } from '@/lib/seo-analyze';
import type { BlogPost, BlogPostInput } from '@/lib/types/blog';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type PublishPostBody = {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  coverImage?: string;
  status?: string;
  publishedAt?: string;
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

function normalizeTags(tags: unknown, category?: string): string[] {
  const list = Array.isArray(tags)
    ? tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean)
    : [];
  if (category) {
    const cat = category.trim().toLowerCase();
    if (cat && !list.includes(cat)) list.unshift(cat);
  }
  return [...new Set(list)];
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

export function buildPostInput(body: PublishPostBody): BlogPostInput {
  const title = body.title?.trim();
  if (!title) throw new Error('title is required');

  const rawContent = body.content?.trim();
  if (!rawContent) throw new Error('content is required');

  let slug = body.slug?.trim().toLowerCase();
  if (!slug) slug = slugify(title);
  if (!slug) throw new Error('slug could not be generated — provide a URL-safe slug');
  if (!SLUG_RE.test(slug)) {
    throw new Error('slug must be lowercase letters, numbers, and hyphens only');
  }

  const tags = normalizeTags(body.tags, body.category);
  const status = normalizeStatus(body.status);
  const coverImage = normalizeCoverImage(body.coverImage);
  const publishedAt = toDateString(body.publishedAt);

  let content = fixLinks(rawContent);
  content = withCoverImage(content, coverImage, title);

  const excerpt = body.excerpt?.trim() || extractExcerptFromContent(content);

  return {
    slug,
    title,
    seoTitle: title,
    excerpt,
    tags,
    focusKeyword: '',
    publishedAt,
    content,
    status,
    coverImage,
  };
}

export async function publishPost(body: PublishPostBody): Promise<BlogPost> {
  const input = buildPostInput(body);
  return createPost(input);
}
