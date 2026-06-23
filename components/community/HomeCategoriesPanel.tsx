import Link from 'next/link';
import { CategoryCountList } from '@/components/community/CategoryCountList';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';

type Props = {
  locale: Locale;
  categoryCounts: { category: string; count: number }[];
  className?: string;
  mobileCollapsedCount?: number;
};

export function HomeCategoriesPanel({
  locale,
  categoryCounts,
  className,
  mobileCollapsedCount,
}: Props) {
  const cd = getCommunityDict(locale);
  const isCollapsibleMobilePanel =
    typeof mobileCollapsedCount === 'number' &&
    mobileCollapsedCount > 0 &&
    className?.includes('forum-mobile-only') === true;
  const toggleId = `forum-categories-toggle-${locale}`;

  return (
    <div className={['forum-block', className].filter(Boolean).join(' ')}>
      {isCollapsibleMobilePanel && (
        <input id={toggleId} type="checkbox" className="forum-categories-toggle" />
      )}
      <div className="forum-block__head">
        <h3>{cd.home.categoriesCaps}</h3>
        {isCollapsibleMobilePanel ? (
          <label htmlFor={toggleId} className="forum-block__head-action forum-categories-toggle__label">
            ყველა →
          </label>
        ) : (
          <Link href={localePath(locale, '/history/')} className="forum-block__head-action">
            ყველა →
          </Link>
        )}
      </div>
      {isCollapsibleMobilePanel ? (
        <>
          <div className="forum-categories-toggle__collapsed">
            <CategoryCountList
              locale={locale}
              counts={categoryCounts}
              variant="chips"
              showSectionTitles={false}
              maxPrimaryChips={mobileCollapsedCount}
            />
          </div>
          <div className="forum-categories-toggle__expanded">
            <CategoryCountList
              locale={locale}
              counts={categoryCounts}
              variant="chips"
              showSectionTitles={false}
            />
          </div>
        </>
      ) : (
        <CategoryCountList
          locale={locale}
          counts={categoryCounts}
          variant="chips"
          showSectionTitles={false}
        />
      )}
    </div>
  );
}
