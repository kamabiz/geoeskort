import Link from 'next/link';
import { CategoryCountList } from '@/components/community/CategoryCountList';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';

type Props = {
  locale: Locale;
  categoryCounts: { category: string; count: number }[];
  className?: string;
};

export function HomeCategoriesPanel({ locale, categoryCounts, className }: Props) {
  const cd = getCommunityDict(locale);

  return (
    <div className={['forum-block', className].filter(Boolean).join(' ')}>
      <div className="forum-block__head">
        <h3>{cd.home.categoriesCaps}</h3>
        <Link href={localePath(locale, '/history/')}>ყველა →</Link>
      </div>
      <CategoryCountList locale={locale} counts={categoryCounts} variant="chips" showSectionTitles={false} />
    </div>
  );
}
