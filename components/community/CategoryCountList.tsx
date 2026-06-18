import Link from 'next/link';
import { STORY_CATEGORIES, STORY_CATEGORY_SLUGS, MODULE_CATEGORIES } from '@/lib/community/categories';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';

type Props = {
  locale: Locale;
  counts: { category: string; count: number }[];
  variant?: 'list' | 'chips';
};

export function CategoryCountList({ locale, counts, variant = 'list' }: Props) {
  const countMap = new Map(counts.map((c) => [c.category, c.count]));

  if (variant === 'chips') {
    return (
      <div className="forum-chips-wrap">
        <div className="forum-chips-section">
          <p className="forum-chips-section__title">ისტორიები</p>
          <div className="forum-chips">
            {STORY_CATEGORY_SLUGS.map((slug) => {
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
            })}
          </div>
        </div>
        <div className="forum-chips-section">
          <p className="forum-chips-section__title">განყოფილებები</p>
          <div className="forum-chips">
            {Object.values(MODULE_CATEGORIES).map((mod) => (
              <Link key={mod.slug} href={localePath(locale, mod.route)} className="forum-chip forum-chip--module">
                <div className="forum-chip__head">
                  <span className="forum-chip__emoji">{mod.emoji}</span>
                  <span className="forum-chip__count">{countMap.get(mod.slug) ?? 0}</span>
                </div>
                <span className="forum-chip__label">{mod.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="community-categories">
      {STORY_CATEGORY_SLUGS.map((slug) => (
        <Link
          key={slug}
          href={localePath(locale, `/history/?category=${slug}`)}
          className="community-categories__item"
        >
          <span>{STORY_CATEGORIES[slug].emoji} {STORY_CATEGORIES[slug].label}</span>
          <strong>{countMap.get(slug) ?? 0}</strong>
        </Link>
      ))}
    </div>
  );
}
