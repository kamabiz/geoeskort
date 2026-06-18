export const BLOG_CATEGORIES = {
  nightlife: {
    slug: 'nightlife',
    label: 'Nightlife',
    description: 'Clubs, bars, rooftops, late-night spots',
    emoji: '🌃',
    keywords: [
      'nightlife', 'club', 'clubs', 'bar', 'bars', 'rooftop', 'rooftops',
      'late-night', 'night', 'dj', 'party', 'techno', 'disco',
    ],
  },
  food: {
    slug: 'food',
    label: 'Food',
    description: 'Khinkali, khachapuri, Georgian wine, chacha, restaurants',
    emoji: '🍷',
    keywords: [
      'food', 'khinkali', 'khachapuri', 'wine', 'chacha', 'restaurant',
      'restaurants', 'supra', 'cuisine', 'eat', 'dining', 'winery', 'tasting',
    ],
  },
  travel: {
    slug: 'travel',
    label: 'Travel',
    description: 'Neighborhoods, transport, visas, money, safety, seasons',
    emoji: '✈️',
    keywords: [
      'travel', 'guide', 'neighborhood', 'transport', 'visa', 'visas', 'money',
      'safety', 'season', 'seasons', 'tbilisi', 'batumi', 'kutaisi', 'georgia',
      'marshrutka', 'airport', 'hotel',
    ],
  },
  culture: {
    slug: 'culture',
    label: 'Culture',
    description: 'Electronic music scene, folk music, festivals, art, history',
    emoji: '🎭',
    keywords: [
      'culture', 'music', 'electronic', 'folk', 'festival', 'festivals', 'art',
      'history', 'museum', 'theatre', 'theater', 'heritage', 'tradition',
    ],
  },
} as const;

export type BlogCategorySlug = keyof typeof BLOG_CATEGORIES;

export const BLOG_CATEGORY_SLUGS = Object.keys(BLOG_CATEGORIES) as BlogCategorySlug[];

export function isBlogCategorySlug(value: string): value is BlogCategorySlug {
  return value in BLOG_CATEGORIES;
}

export function getCategoryMeta(slug: string) {
  if (isBlogCategorySlug(slug)) return BLOG_CATEGORIES[slug];
  return null;
}

export function getCategoryLabel(slug: string): string {
  return getCategoryMeta(slug)?.label ?? slug;
}

export function getCategoryEmoji(slug: string): string {
  return getCategoryMeta(slug)?.emoji ?? '📝';
}

export function inferCategoryFromContent(
  title: string,
  content: string,
  tags: string[] = [],
): BlogCategorySlug {
  const hay = `${title} ${content.replace(/<[^>]+>/g, ' ')} ${tags.join(' ')}`.toLowerCase();

  let best: BlogCategorySlug = 'travel';
  let bestScore = 0;

  for (const slug of BLOG_CATEGORY_SLUGS) {
    const { keywords } = BLOG_CATEGORIES[slug];
    let score = 0;
    if (tags.some((t) => t.toLowerCase() === slug)) score += 10;
    for (const kw of keywords) {
      if (hay.includes(kw)) score += kw.length > 4 ? 2 : 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = slug;
    }
  }

  return best;
}

export function normalizeCategory(
  category: string | undefined,
  title: string,
  content: string,
  tags: string[] = [],
): BlogCategorySlug {
  const raw = category?.trim().toLowerCase();
  if (raw) {
    if (isBlogCategorySlug(raw)) return raw;
    throw new Error(`Invalid category "${category}". Use: nightlife, food, travel, culture`);
  }
  return inferCategoryFromContent(title, content, tags);
}
