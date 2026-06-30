import Link from 'next/link';
import {
  STORY_CATEGORIES,
  STORY_CATEGORY_SLUGS,
  MODULE_CATEGORIES,
  type StoryCategorySlug,
} from '@/lib/community/categories';
import { isPremiumEnabled } from '@/lib/community/premium-config';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';

type Props = {
  locale: Locale;
  counts: { category: string; count: number }[];
  variant?: 'list' | 'chips';
  showSectionTitles?: boolean;
  maxPrimaryChips?: number;
};

type PrimaryChipItem = StoryCategorySlug | 'all-stories' | keyof typeof MODULE_CATEGORIES;

const INLINE_MODULES_AFTER: Partial<
  Record<StoryCategorySlug, (keyof typeof MODULE_CATEGORIES)[]>
> = {
  'lesbian-stories': ['questions-advice'],
};

function buildPrimaryChipItems(
  categorySlugs: StoryCategorySlug[],
  showVarious: boolean,
  premiumStorySlugs: StoryCategorySlug[],
): PrimaryChipItem[] {
  const items: PrimaryChipItem[] = [];

  for (const slug of categorySlugs) {
    items.push(slug);
    const inlineModules = INLINE_MODULES_AFTER[slug];
    if (inlineModules) items.push(...inlineModules);
  }

  if (showVarious) items.push('various');
  items.push(...premiumStorySlugs, 'all-stories');

  return items;
}

function getVisibleStorySlugs(): StoryCategorySlug[] {
  return STORY_CATEGORY_SLUGS.filter(
    (slug) => isPremiumEnabled() || !STORY_CATEGORIES[slug].isPremiumOnly,
  );
}

function isModuleChipItem(item: PrimaryChipItem): item is keyof typeof MODULE_CATEGORIES {
  return item in MODULE_CATEGORIES;
}

export function CategoryCountList({
  locale,
  counts,
  variant = 'list',
  showSectionTitles = true,
  maxPrimaryChips,
}: Props) {
  const cd = getCommunityDict(locale);
  const countMap = new Map(counts.map((c) => [c.category, c.count]));
  const storySlugs = getVisibleStorySlugs();
  const categorySlugs = storySlugs.filter(
    (slug) => slug !== 'various' && slug !== 'restricted-stories',
  );
  const premiumStorySlugs = storySlugs.filter((slug) => slug === 'restricted-stories');
  const showVarious = storySlugs.includes('various');
  const allStoriesCount = storySlugs.reduce(
    (sum, slug) => sum + (countMap.get(slug) ?? 0),
    0,
  );

  const renderStoryChip = (slug: StoryCategorySlug) => {
    const cat = STORY_CATEGORIES[slug];
    return (
      <Link
        key={slug}
        href={localePath(locale, `/history/?category=${slug}`)}
        className={`forum-chip${cat.isPremiumOnly ? ' forum-chip--premium' : ''}`}
      >
        <div className="forum-chip__head">
          <span className="forum-chip__emoji">{cat.emoji}</span>
          <span className="forum-chip__count">{countMap.get(slug) ?? 0}</span>
        </div>
        <span className="forum-chip__label">{cat.label}</span>
      </Link>
    );
  };

  const renderAllStoriesChip = () => (
    <Link
      key="all-stories"
      href={localePath(locale, '/history/')}
      className="forum-chip"
    >
      <div className="forum-chip__head">
        <span className="forum-chip__emoji">📚</span>
        <span className="forum-chip__count">{allStoriesCount}</span>
      </div>
      <span className="forum-chip__label">{cd.home.allStoriesChip}</span>
    </Link>
  );

  const renderModuleChip = (slug: keyof typeof MODULE_CATEGORIES) => {
    const mod = MODULE_CATEGORIES[slug];
    return (
      <Link key={mod.slug} href={localePath(locale, mod.route)} className="forum-chip forum-chip--module">
        <div className="forum-chip__head">
          <span className="forum-chip__emoji">{mod.emoji}</span>
          <span className="forum-chip__count">{countMap.get(mod.slug) ?? 0}</span>
        </div>
        <span className="forum-chip__label">{mod.label}</span>
      </Link>
    );
  };

  const moduleSlugs: (keyof typeof MODULE_CATEGORIES)[] = [
    'sexology',
    'zodiac-compatibility',
  ];

  const primaryTrailingModuleSlugs: (keyof typeof MODULE_CATEGORIES)[] = [
    'dating-crush',
    'positions-education',
  ];

  if (variant === 'chips') {
    const primaryChipItems = buildPrimaryChipItems(
      categorySlugs,
      showVarious,
      premiumStorySlugs,
    );
    const visiblePrimaryChipItems =
      typeof maxPrimaryChips === 'number' && maxPrimaryChips > 0
        ? primaryChipItems.slice(0, maxPrimaryChips)
        : primaryChipItems;

    return (
      <div className="forum-chips-wrap">
        <div className="forum-chips-section">
          {showSectionTitles && <p className="forum-chips-section__title">ისტორიები</p>}
          <div className="forum-chips forum-chips--primary">
            {visiblePrimaryChipItems.map((item) => {
              if (item === 'all-stories') return renderAllStoriesChip();
              if (isModuleChipItem(item)) return renderModuleChip(item);
              return renderStoryChip(item);
            })}
            {primaryTrailingModuleSlugs.map(renderModuleChip)}
          </div>
        </div>
        <div className="forum-chips-section">
          {showSectionTitles && <p className="forum-chips-section__title">განყოფილებები</p>}
          <div className="forum-chips forum-chips--modules">
            {moduleSlugs.map(renderModuleChip)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="community-categories">
      {categorySlugs.map((slug) => (
        <Link
          key={slug}
          href={localePath(locale, `/history/?category=${slug}`)}
          className="community-categories__item"
        >
          <span>{STORY_CATEGORIES[slug].emoji} {STORY_CATEGORIES[slug].label}</span>
          <strong>{countMap.get(slug) ?? 0}</strong>
        </Link>
      ))}
      {showVarious && (
        <Link
          href={localePath(locale, '/history/?category=various')}
          className="community-categories__item"
        >
          <span>{STORY_CATEGORIES.various.emoji} {STORY_CATEGORIES.various.label}</span>
          <strong>{countMap.get('various') ?? 0}</strong>
        </Link>
      )}
      {premiumStorySlugs.map((slug) => (
        <Link
          key={slug}
          href={localePath(locale, `/history/?category=${slug}`)}
          className="community-categories__item"
        >
          <span>{STORY_CATEGORIES[slug].emoji} {STORY_CATEGORIES[slug].label}</span>
          <strong>{countMap.get(slug) ?? 0}</strong>
        </Link>
      ))}
      <Link href={localePath(locale, '/history/')} className="community-categories__item">
        <span>📚 {cd.home.allStoriesChip}</span>
        <strong>{allStoriesCount}</strong>
      </Link>
    </div>
  );
}
