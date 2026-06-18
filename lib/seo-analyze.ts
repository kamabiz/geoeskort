export type SeoSuggestion = {
  id: string;
  type: 'success' | 'warning' | 'error' | 'tip';
  message: string;
};

export type SeoAnalysis = {
  score: number;
  titleLength: number;
  excerptLength: number;
  wordCount: number;
  hasH2: boolean;
  hasKamaLink: boolean;
  slugLength: number;
  suggestions: SeoSuggestion[];
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function slugify(text: string): string {
  const map: Record<string, string> = {
    ა: 'a', ბ: 'b', გ: 'g', დ: 'd', ე: 'e', ვ: 'v', ზ: 'z', თ: 't', ი: 'i',
    კ: 'k', ლ: 'l', მ: 'm', ნ: 'n', ო: 'o', პ: 'p', ჟ: 'zh', რ: 'r', ს: 's',
    ტ: 't', უ: 'u', ფ: 'f', ქ: 'q', ღ: 'gh', ყ: 'y', შ: 'sh', ჩ: 'ch', ც: 'ts',
    ძ: 'dz', წ: 'ts', ჭ: 'ch', ხ: 'kh', ჯ: 'j', ჰ: 'h',
  };
  const latin = text
    .split('')
    .map((c) => map[c] ?? c)
    .join('')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return latin
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

export function extractExcerptFromContent(html: string, max = 155): string {
  const text = stripHtml(html);
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim() + '…';
}

const TAG_SUGGESTIONS = [
  'tbilisi', 'batumi', 'kutaisi', 'georgia', 'guide', 'nightlife', 'food', 'travel', 'culture',
  'khinkali', 'wine', 'festival', 'restaurant', 'neighborhood',
];

export function suggestTags(title: string, content: string, existing: string[]): string[] {
  const hay = `${title} ${stripHtml(content)}`.toLowerCase();
  return TAG_SUGGESTIONS.filter(
    (tag) => hay.includes(tag) && !existing.includes(tag),
  ).slice(0, 5);
}

export function analyzeSeo(input: {
  title: string;
  seoTitle?: string;
  excerpt: string;
  slug: string;
  content: string;
  focusKeyword?: string;
  tags?: string[];
}): SeoAnalysis {
  const suggestions: SeoSuggestion[] = [];
  let score = 0;

  const displayTitle = input.seoTitle || input.title;
  const titleLength = displayTitle.length;
  const excerptLength = input.excerpt.length;
  const wordCount = stripHtml(input.content).split(/\s+/).filter(Boolean).length;
  const hasH2 = /<h2[\s>]/i.test(input.content);
  const hasH1 = /<h1[\s>]/i.test(input.content);
  const hasKamaLink = /kama\.biz/i.test(input.content);
  const slugLength = input.slug.length;
  const kw = input.focusKeyword?.toLowerCase().trim() || '';
  const titleLower = displayTitle.toLowerCase();
  const excerptLower = input.excerpt.toLowerCase();
  const slugLower = input.slug.toLowerCase();
  const contentLower = stripHtml(input.content).toLowerCase();

  // Title
  if (titleLength >= 30 && titleLength <= 60) {
    score += 15;
    suggestions.push({ id: 'title-len', type: 'success', message: 'Title length is ideal (30–60 chars).' });
  } else if (titleLength < 30) {
    score += 5;
    suggestions.push({ id: 'title-short', type: 'warning', message: 'Title is short — aim for 30–60 characters for better SEO.' });
  } else {
    score += 5;
    suggestions.push({ id: 'title-long', type: 'warning', message: 'Title may be truncated in Google — keep under 60 characters.' });
  }

  // Meta description
  if (excerptLength >= 120 && excerptLength <= 160) {
    score += 15;
    suggestions.push({ id: 'excerpt-len', type: 'success', message: 'Meta description length is perfect (120–160 chars).' });
  } else if (excerptLength < 80) {
    suggestions.push({ id: 'excerpt-short', type: 'error', message: 'Meta description too short — write 120–160 characters.' });
  } else if (excerptLength > 160) {
    score += 8;
    suggestions.push({ id: 'excerpt-long', type: 'warning', message: 'Meta description may be cut off — trim to ~155 characters.' });
  } else {
    score += 10;
    suggestions.push({ id: 'excerpt-ok', type: 'tip', message: 'Meta description is okay — 120–160 chars is the sweet spot.' });
  }

  // Slug
  if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug) && slugLength >= 3 && slugLength <= 60) {
    score += 10;
    suggestions.push({ id: 'slug-ok', type: 'success', message: 'URL slug is clean and SEO-friendly.' });
  } else {
    suggestions.push({ id: 'slug-bad', type: 'error', message: 'Use lowercase letters, numbers, and hyphens only in the slug.' });
  }

  // Content length
  if (wordCount >= 300) {
    score += 15;
    suggestions.push({ id: 'words-ok', type: 'success', message: `${wordCount} words — good depth for search rankings.` });
  } else if (wordCount >= 150) {
    score += 8;
    suggestions.push({ id: 'words-mid', type: 'warning', message: `${wordCount} words — aim for 300+ for competitive keywords.` });
  } else {
    suggestions.push({ id: 'words-low', type: 'error', message: `Only ${wordCount} words — add more substance (300+ recommended).` });
  }

  // Headings
  if (hasH2) {
    score += 10;
    suggestions.push({ id: 'h2-ok', type: 'success', message: 'Content uses H2 subheadings — great for structure.' });
  } else {
    suggestions.push({ id: 'h2-missing', type: 'warning', message: 'Add at least one H2 subheading to structure your article.' });
  }

  if (hasH1) {
    suggestions.push({ id: 'h1-warn', type: 'warning', message: 'Remove H1 from content — the page title is already H1.' });
  }

  // KAMA link
  if (hasKamaLink) {
    score += 10;
    suggestions.push({ id: 'kama-link', type: 'success', message: 'Includes link to KAMA.BIZ — good for internal linking strategy.' });
  } else {
    suggestions.push({ id: 'kama-missing', type: 'tip', message: 'Add a contextual link to kama.biz/tbilisi or relevant catalog page.' });
  }

  // Focus keyword
  if (kw) {
    let kwScore = 0;
    if (titleLower.includes(kw)) kwScore += 5;
    else suggestions.push({ id: 'kw-title', type: 'warning', message: `Include focus keyword "${input.focusKeyword}" in the title.` });

    if (excerptLower.includes(kw)) kwScore += 5;
    else suggestions.push({ id: 'kw-excerpt', type: 'warning', message: `Include focus keyword in the meta description.` });

    if (slugLower.includes(kw.replace(/\s+/g, '-'))) kwScore += 5;
    else suggestions.push({ id: 'kw-slug', type: 'tip', message: 'Consider adding the focus keyword to the URL slug.' });

    const kwCount = (contentLower.match(new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    if (kwCount >= 2 && kwCount <= 8) {
      kwScore += 10;
      suggestions.push({ id: 'kw-density', type: 'success', message: `Focus keyword appears ${kwCount} times — natural density.` });
    } else if (kwCount < 2) {
      suggestions.push({ id: 'kw-rare', type: 'warning', message: 'Use the focus keyword 2–5 times naturally in the content.' });
    } else {
      kwScore += 5;
      suggestions.push({ id: 'kw-stuff', type: 'warning', message: 'Keyword appears too often — reduce to avoid stuffing.' });
    }
    score += kwScore;
  } else {
    suggestions.push({ id: 'kw-set', type: 'tip', message: 'Set a focus keyword (e.g. "eskortebi tbilisi") to optimize for search.' });
  }

  // Tags
  if (input.tags && input.tags.length >= 2) {
    score += 5;
    suggestions.push({ id: 'tags-ok', type: 'success', message: 'Tags help categorize and enrich structured data.' });
  } else {
    suggestions.push({ id: 'tags-add', type: 'tip', message: 'Add 2–4 tags (tbilisi, eskortebi, guide, etc.).' });
  }

  // Paragraphs
  const paragraphs = (input.content.match(/<p[\s>]/gi) || []).length;
  if (paragraphs >= 3) score += 5;

  score = Math.min(100, Math.max(0, score));

  return {
    score,
    titleLength,
    excerptLength,
    wordCount,
    hasH2,
    hasKamaLink,
    slugLength,
    suggestions,
  };
}
