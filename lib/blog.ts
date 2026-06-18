import 'server-only';

import fs from 'fs';
import path from 'path';
import type { BlogPost } from '@/lib/types/blog';

const CONTENT_DIR = path.join(process.cwd(), 'blog-content');

const EMOJI: Record<string, string> = {
  eskortebi: '🇬🇪',
  'escort-tbilisi': '🏙️',
  tbilisi: '🏙️',
  gogoebi: '✨',
  nightlife: '🌃',
  batumi: '🌊',
  kama: '🔗',
};

function pickEmoji(slug: string, tags: string[]): string {
  const s = `${slug} ${tags.join(' ')}`;
  for (const [key, em] of Object.entries(EMOJI)) {
    if (s.includes(key)) return em;
  }
  return '📝';
}

function parseMeta(text: string, key: string): string {
  const m = text.match(new RegExp(`\\*\\*${key}:\\*\\*\\s*(.+)`, 'i'));
  return m ? m[1].trim() : '';
}

function fixLinks(html: string): string {
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

function parseMdFile(filePath: string): BlogPost | null {
  const raw = fs.readFileSync(filePath, 'utf8');
  const title = parseMeta(raw, 'Title');
  const slug = parseMeta(raw, 'Slug');
  const excerpt = parseMeta(raw, 'Excerpt');
  if (!title || !slug) return null;

  const tagsLine = parseMeta(raw, 'Tags');
  const tags = tagsLine ? tagsLine.split(',').map((t) => t.trim()) : [];
  const htmlMatch = raw.match(/```html\n([\s\S]*?)```/);
  let content = htmlMatch ? htmlMatch[1].trim() : '';
  content = fixLinks(content);

  const category = tags[0]?.includes('tbilisi')
    ? 'თბილისი'
    : tags.some((t) => /nightlife|night/i.test(t))
      ? 'Nightlife'
      : 'გზამკვლევი';

  const dateMatch = parseMeta(raw, 'Date');
  const idx = parseInt(filePath.match(/blog-(\d+)/)?.[1] || '1', 10) - 1;
  const fallbackDates = ['2026-03-01', '2026-03-08', '2026-03-15'];

  return {
    slug,
    title,
    excerpt,
    category,
    emoji: pickEmoji(slug, tags),
    publishedAt: dateMatch || fallbackDates[idx] || new Date().toISOString().slice(0, 10),
    content,
  };
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.md') && f.toLowerCase() !== 'readme.md')
    .map((f) => parseMdFile(path.join(CONTENT_DIR, f)))
    .filter((p): p is BlogPost => p !== null)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}
