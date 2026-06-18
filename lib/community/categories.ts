export const COMMUNITY_CATEGORIES = {
  'erotic-stories': {
    slug: 'erotic-stories',
    label: 'ეროტიკული ისტორიები',
    emoji: '🔥',
  },
  'chat-room': {
    slug: 'chat-room',
    label: 'სასაუბრო ოთახი',
    emoji: '💬',
  },
  'questions-advice': {
    slug: 'questions-advice',
    label: 'კითხვები & რჩევები',
    emoji: '❓',
  },
  'dating-crush': {
    slug: 'dating-crush',
    label: 'იპოვე შენი ქრაში',
    emoji: '💕',
  },
  sexology: {
    slug: 'sexology',
    label: 'სამედიცინო სექსოლოგია',
    emoji: '🩺',
  },
  'positions-education': {
    slug: 'positions-education',
    label: 'ინტიმური პოზები',
    emoji: '📖',
  },
  awareness: {
    slug: 'awareness',
    label: 'ცნობიერების ამაღლება',
    emoji: '✨',
  },
  'zodiac-compatibility': {
    slug: 'zodiac-compatibility',
    label: 'ზოდიაქოს თავსებადობა',
    emoji: '♈',
  },
  'restricted-stories': {
    slug: 'restricted-stories',
    label: 'შეზღუდული ისტორიები',
    emoji: '🔒',
  },
  support: {
    slug: 'support',
    label: 'დახმარება & მხარდაჭერა',
    emoji: '🤝',
  },
} as const;

export type CommunityCategorySlug = keyof typeof COMMUNITY_CATEGORIES;

export const COMMUNITY_CATEGORY_SLUGS = Object.keys(
  COMMUNITY_CATEGORIES,
) as CommunityCategorySlug[];

export function isCommunityCategorySlug(value: string): value is CommunityCategorySlug {
  return value in COMMUNITY_CATEGORIES;
}

export function getCommunityCategoryLabel(slug: string): string {
  if (isCommunityCategorySlug(slug)) return COMMUNITY_CATEGORIES[slug].label;
  return slug;
}

export function getCommunityCategoryEmoji(slug: string): string {
  if (isCommunityCategorySlug(slug)) return COMMUNITY_CATEGORIES[slug].emoji;
  return '📝';
}
