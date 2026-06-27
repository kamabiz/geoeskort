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
  collapseToFirstRow?: boolean;
  desktopCollapsedCount?: number;
};

export function HomeCategoriesPanel({
  locale,
  categoryCounts,
  className,
  mobileCollapsedCount,
  collapseToFirstRow = false,
  desktopCollapsedCount,
}: Props) {
  const cd = getCommunityDict(locale);
  const isCollapsibleMobilePanel =
    typeof mobileCollapsedCount === 'number' &&
    mobileCollapsedCount > 0 &&
    className?.includes('forum-mobile-only') === true;
  const isCollapsibleDesktopPanel =
    (collapseToFirstRow || typeof desktopCollapsedCount === 'number') &&
    className?.includes('forum-desktop-only') === true;
  const isCollapsible = isCollapsibleMobilePanel || isCollapsibleDesktopPanel;
  const toggleId = `forum-categories-toggle-${locale}-${
    isCollapsibleMobilePanel ? 'mobile' : 'desktop'
  }`;

  const renderChipList = (maxPrimaryChips?: number) => (
    <CategoryCountList
      locale={locale}
      counts={categoryCounts}
      variant="chips"
      showSectionTitles={false}
      maxPrimaryChips={maxPrimaryChips}
    />
  );

  let body: React.ReactNode;
  if (isCollapsibleMobilePanel) {
    body = (
      <>
        <div className="forum-categories-toggle__collapsed">
          {renderChipList(mobileCollapsedCount)}
        </div>
        <div className="forum-categories-toggle__expanded">
          {renderChipList()}
        </div>
      </>
    );
  } else if (isCollapsibleDesktopPanel && typeof desktopCollapsedCount === 'number') {
    body = (
      <>
        <div className="forum-categories-toggle__collapsed">
          {renderChipList(desktopCollapsedCount)}
        </div>
        <div className="forum-categories-toggle__expanded">
          {renderChipList()}
        </div>
      </>
    );
  } else {
    body = (
      <div className={isCollapsibleDesktopPanel ? 'forum-categories-toggle__content' : undefined}>
        {renderChipList()}
      </div>
    );
  }

  return (
    <div className={['forum-block', className].filter(Boolean).join(' ')}>
      {isCollapsible && (
        <input id={toggleId} type="checkbox" className="forum-categories-toggle" />
      )}
      <div className="forum-block__head">
        <h3>{cd.home.categoriesCaps}</h3>
        {isCollapsible ? (
          <label htmlFor={toggleId} className="forum-block__head-action forum-categories-toggle__label">
            ყველა →
          </label>
        ) : (
          <Link href={localePath(locale, '/history/')} className="forum-block__head-action">
            ყველა →
          </Link>
        )}
      </div>
      {body}
    </div>
  );
}
