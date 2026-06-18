import type { BlogCategorySlug } from '@/lib/blog-categories';
import {
  getCategoryEmoji,
  inferCategoryFromContent,
  isBlogCategorySlug,
  normalizeCategory,
} from '@/lib/blog-categories';

/** Parsed legacy single-locale markdown file (ka-only posts). */
export type LegacyMarkdownPost = {
  slug: string;
  title: string;
  seoTitle: string;
  excerpt: string;
  tags: string[];
  focusKeyword: string;
  category: BlogCategorySlug;
  emoji: string;
  publishedAt: string;
  content: string;
  status: 'published' | 'draft';
  coverImage?: string;
};

const SLUG_EMOJI: Record<string, string> = {
  eskortebi: '🇬🇪',
  'escort-tbilisi': '🏙️',
  tbilisi: '🏙️',
  gogoebi: '✨',
  batumi: '🌊',
  kama: '🔗',
};

function parseMeta(text: string, key: string): string {
  const m = text.match(new RegExp(`\\*\\*${key}:\\*\\*\\s*(.+)`, 'i'));
  return m ? m[1].trim() : '';
}

function pickEmoji(category: string, slug: string, tags: string[]): string {
  if (isBlogCategorySlug(category)) return getCategoryEmoji(category);
  const s = `${slug} ${tags.join(' ')}`;
  for (const [key, em] of Object.entries(SLUG_EMOJI)) {
    if (s.includes(key)) return em;
  }
  return '📝';
}

export function fixLinks(html: string): string {
  const ext = ' rel="noopener"';
  return html
    .replace(/href="\/escorts"/g, `href="https://kama.biz/escorts"${ext}`)
    .replace(/href="\/tbilisi"/g, `href="https://kama.biz/tbilisi"${ext}`)
    .replace(/href="\/batumi"/g, `href="https://kama.biz/batumi"${ext}`)
    .replace(/href="\/girls"/g, `href="https://kama.biz/girls"${ext}`)
    .replace(/href="\/boys"/g, `href="https://kama.biz/boys"${ext}`)
    .replace(/href="\/kutaisi"/g, `href="https://kama.biz/kutaisi"${ext}`)
    .replace(/href="\/independent"/g, `href="https://kama.biz/independent"${ext}`);
}

export function parseMarkdown(raw: string, filename?: string): LegacyMarkdownPost | null {
  const title = parseMeta(raw, 'Title');
  const slug = parseMeta(raw, 'Slug');
  const excerpt = parseMeta(raw, 'Excerpt');
  if (!title || !slug) return null;

  const tagsLine = parseMeta(raw, 'Tags');
  const tags = tagsLine ? tagsLine.split(',').map((t) => t.trim()).filter(Boolean) : [];
  const focusKeyword = parseMeta(raw, 'Focus Keyword');
  const seoTitle = parseMeta(raw, 'SEO Title') || title;
  const statusRaw = parseMeta(raw, 'Status').toLowerCase();
  const status: 'published' | 'draft' = statusRaw === 'draft' ? 'draft' : 'published';
  const coverImage = parseMeta(raw, 'Cover Image') || undefined;
  const categoryRaw = parseMeta(raw, 'Category');

  const htmlMatch = raw.match(/```html\n([\s\S]*?)```/);
  let content = htmlMatch ? htmlMatch[1].trim() : '';
  content = fixLinks(content);

  const category = normalizeCategory(categoryRaw, title, content, tags);

  const dateMatch = parseMeta(raw, 'Date');
  const idx = parseInt(filename?.match(/blog-(\d+)/)?.[1] || '1', 10) - 1;
  const fallbackDates = ['2026-03-01', '2026-03-08', '2026-03-15'];

  return {
    slug,
    title,
    seoTitle: seoTitle || title,
    excerpt,
    tags,
    focusKeyword: focusKeyword || '',
    category,
    emoji: pickEmoji(category, slug, tags),
    publishedAt: dateMatch || fallbackDates[idx] || new Date().toISOString().slice(0, 10),
    content,
    status,
    coverImage,
  };
}

export { inferCategoryFromContent };
