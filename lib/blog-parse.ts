import type { BlogPost, BlogPostInput } from '@/lib/types/blog';

const EMOJI: Record<string, string> = {
  eskortebi: '🇬🇪',
  'escort-tbilisi': '🏙️',
  tbilisi: '🏙️',
  gogoebi: '✨',
  nightlife: '🌃',
  batumi: '🌊',
  kama: '🔗',
};

function parseMeta(text: string, key: string): string {
  const m = text.match(new RegExp(`\\*\\*${key}:\\*\\*\\s*(.+)`, 'i'));
  return m ? m[1].trim() : '';
}

function pickEmoji(slug: string, tags: string[]): string {
  const s = `${slug} ${tags.join(' ')}`;
  for (const [key, em] of Object.entries(EMOJI)) {
    if (s.includes(key)) return em;
  }
  return '📝';
}

function inferCategory(tags: string[]): string {
  if (tags.some((t) => t.includes('tbilisi'))) return 'თბილისი';
  if (tags.some((t) => /nightlife|night/i.test(t))) return 'Nightlife';
  if (tags.some((t) => t.includes('batumi'))) return 'ბათუმი';
  if (tags.some((t) => /food|travel|guide/i.test(t))) return tags.find((t) => /food|travel|guide/i.test(t)) || 'გზამკვლევი';
  return 'გზამკვლევი';
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

export function parseMarkdown(raw: string, filename?: string): BlogPost | null {
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

  const htmlMatch = raw.match(/```html\n([\s\S]*?)```/);
  let content = htmlMatch ? htmlMatch[1].trim() : '';
  content = fixLinks(content);

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
    category: inferCategory(tags),
    emoji: pickEmoji(slug, tags),
    publishedAt: dateMatch || fallbackDates[idx] || new Date().toISOString().slice(0, 10),
    content,
    status,
    coverImage,
  };
}

export function serializeMarkdown(post: BlogPostInput): string {
  const tags = post.tags.join(', ');
  const focusLine = post.focusKeyword ? `- **Focus Keyword:** ${post.focusKeyword}\n` : '';
  const seoLine = post.seoTitle && post.seoTitle !== post.title
    ? `- **SEO Title:** ${post.seoTitle}\n`
    : '';
  const statusLine = post.status === 'draft' ? '- **Status:** draft\n' : '';
  const coverLine = post.coverImage ? `- **Cover Image:** ${post.coverImage}\n` : '';

  return `# Blog Post: ${post.title}

## Meta Information
- **Title:** ${post.title}
- **Slug:** ${post.slug}
- **Excerpt:** ${post.excerpt}
- **Date:** ${post.publishedAt}
- **Tags:** ${tags}
${focusLine}${seoLine}${statusLine}${coverLine}
---

## Content (HTML)

\`\`\`html
${post.content.trim()}
\`\`\`
`;
}

export function inputFromPost(post: BlogPost): BlogPostInput {
  return {
    slug: post.slug,
    title: post.title,
    seoTitle: post.seoTitle,
    excerpt: post.excerpt,
    tags: post.tags,
    focusKeyword: post.focusKeyword,
    publishedAt: post.publishedAt,
    content: post.content,
    status: post.status,
    coverImage: post.coverImage,
  };
}
