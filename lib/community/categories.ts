/** Story categories for /history — exact labels as specified */
export const STORY_CATEGORIES = {
  'mens-stories': {
    slug: 'mens-stories',
    label: 'მამაკაცების ისტორიები',
    emoji: '👨',
    isPremiumOnly: false,
  },
  'womens-stories': {
    slug: 'womens-stories',
    label: 'ქალების ისტორიები',
    emoji: '👩',
    isPremiumOnly: false,
  },
  'gay-stories': {
    slug: 'gay-stories',
    label: 'გეი ისტორიები',
    emoji: '🏳️‍🌈',
    isPremiumOnly: false,
  },
  'lesbian-stories': {
    slug: 'lesbian-stories',
    label: 'ლესბოსური ისტორიები',
    emoji: '💜',
    isPremiumOnly: false,
  },
  'transgender-stories': {
    slug: 'transgender-stories',
    label: 'ტრანსგენდერ ისტორიები',
    emoji: '⚧️',
    isPremiumOnly: false,
  },
  various: {
    slug: 'various',
    label: 'სხვადასხვა',
    emoji: '✨',
    isPremiumOnly: false,
  },
  'restricted-stories': {
    slug: 'restricted-stories',
    label: 'პრემიუმ ისტორიები',
    emoji: '🔒',
    isPremiumOnly: true,
  },
} as const;

/** Module post categories (forum, articles, crush, etc.) */
export const MODULE_CATEGORIES = {
  'questions-advice': {
    slug: 'questions-advice',
    label: 'კითხვები & რჩევები',
    emoji: '❓',
    route: '/questions/',
  },
  sexology: {
    slug: 'sexology',
    label: 'სამედიცინო სექსოლოგია',
    emoji: '🩺',
    route: '/medical/',
  },
  'dating-crush': {
    slug: 'dating-crush',
    label: 'იპოვე შენი ქრაში',
    emoji: '💕',
    route: '/crush/',
  },
  'positions-education': {
    slug: 'positions-education',
    label: 'ინტიმური პოზები',
    emoji: '📖',
    route: '/positionVariants/',
  },
  'zodiac-compatibility': {
    slug: 'zodiac-compatibility',
    label: 'ზოდიაქოს თავსებადობა',
    emoji: '♈',
    route: '/zodiac/',
  },
} as const;

/** Legacy slugs from earlier versions */
const LEGACY_LABELS: Record<string, string> = {
  'erotic-stories': 'ეროტიკული ისტორიები',
  'chat-room': 'სასაუბრო ოთახი',
  awareness: 'ცნობიერების ამაღლება',
  support: 'დახმარება & მხარდაჭერა',
};

export const COMMUNITY_CATEGORIES = {
  ...STORY_CATEGORIES,
  ...MODULE_CATEGORIES,
} as const;

export type StoryCategorySlug = keyof typeof STORY_CATEGORIES;
export type ModuleCategorySlug = keyof typeof MODULE_CATEGORIES;
export type CommunityCategorySlug = keyof typeof COMMUNITY_CATEGORIES;

export const STORY_CATEGORY_SLUGS = Object.keys(STORY_CATEGORIES) as StoryCategorySlug[];
export const MODULE_CATEGORY_SLUGS = Object.keys(MODULE_CATEGORIES) as ModuleCategorySlug[];
export const COMMUNITY_CATEGORY_SLUGS = Object.keys(COMMUNITY_CATEGORIES) as CommunityCategorySlug[];

export function isStoryCategorySlug(value: string): value is StoryCategorySlug {
  return value in STORY_CATEGORIES;
}

export function isModuleCategorySlug(value: string): value is ModuleCategorySlug {
  return value in MODULE_CATEGORIES;
}

export function isCommunityCategorySlug(value: string): value is CommunityCategorySlug {
  return value in COMMUNITY_CATEGORIES || value in LEGACY_LABELS;
}

export function getCommunityCategoryLabel(slug: string): string {
  if (slug in STORY_CATEGORIES) return STORY_CATEGORIES[slug as StoryCategorySlug].label;
  if (slug in MODULE_CATEGORIES) return MODULE_CATEGORIES[slug as ModuleCategorySlug].label;
  if (slug in LEGACY_LABELS) return LEGACY_LABELS[slug];
  return slug;
}

export function getCommunityCategoryEmoji(slug: string): string {
  if (slug in STORY_CATEGORIES) return STORY_CATEGORIES[slug as StoryCategorySlug].emoji;
  if (slug in MODULE_CATEGORIES) return MODULE_CATEGORIES[slug as ModuleCategorySlug].emoji;
  return '📝';
}

export function getStoryViewPath(id: string): string {
  return `/history/view/${id}/`;
}

export function getCommunityPostViewPath(category: string, id: string): string {
  if (category === 'questions-advice') return `/questions/view/${id}/`;
  if (isStoryCategorySlug(category)) return getStoryViewPath(id);
  if (isModuleCategorySlug(category)) return `/p/${id}/`;
  return `/p/${id}/`;
}

export function getCommunityPostListPath(category: string): string {
  if (category === 'questions-advice') return '/questions/';
  if (isStoryCategorySlug(category)) return `/history/?category=${category}`;
  if (isModuleCategorySlug(category)) return MODULE_CATEGORIES[category].route;
  return '/history/';
}

/** Enforced when submitting from a module page (questions, crush, etc.) */
export const SUBMIT_MODULE_CATEGORIES = {
  questions: 'questions-advice',
  crush: 'dating-crush',
  medical: 'sexology',
} as const;

export type SubmitModuleContext = keyof typeof SUBMIT_MODULE_CATEGORIES;

export function isSubmitModuleContext(value: string): value is SubmitModuleContext {
  return value in SUBMIT_MODULE_CATEGORIES;
}

export function resolveSubmitCategory(
  category: string,
  moduleContext?: string,
): string {
  if (moduleContext && isSubmitModuleContext(moduleContext)) {
    return SUBMIT_MODULE_CATEGORIES[moduleContext];
  }
  return category;
}
