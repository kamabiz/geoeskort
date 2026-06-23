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
};

function getVisibleStorySlugs(): StoryCategorySlug[] {
  return STORY_CATEGORY_SLUGS.filter(
    (slug) => isPremiumEnabled() || !STORY_CATEGORIES[slug].isPremiumOnly,
  );
}

export function CategoryCountList({ locale, counts, variant = 'list', showSectionTitles = true }: Props) {
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
    'questions-advice',
    'sexology',
    'zodiac-compatibility',
    'dating-crush',
    'positions-education',
  ];

  if (variant === 'chips') {
    return (
      <div className="forum-chips-wrap">
        <div className="forum-chips-section">
          {showSectionTitles && <p className="forum-chips-section__title">ისტორიები</p>}
          <div className="forum-chips forum-chips--primary">
            {categorySlugs.map(renderStoryChip)}
            {renderAllStoriesChip()}
            {premiumStorySlugs.map(renderStoryChip)}
            {showVarious && renderStoryChip('various')}
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
      <Link href={localePath(locale, '/history/')} className="community-categories__item">
        <span>📚 {cd.home.allStoriesChip}</span>
        <strong>{allStoriesCount}</strong>
      </Link>
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
      {showVarious && (
        <Link
          href={localePath(locale, '/history/?category=various')}
          className="community-categories__item"
        >
          <span>{STORY_CATEGORIES.various.emoji} {STORY_CATEGORIES.various.label}</span>
          <strong>{countMap.get('various') ?? 0}</strong>
        </Link>
      )}
    </div>
  );
}
