import Link from 'next/link';
import { COMMUNITY_CATEGORIES } from '@/lib/community/categories';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';

type Props = {
  locale: Locale;
  counts: { category: string; count: number }[];
};

export function CategoryCountList({ locale, counts }: Props) {
  const countMap = new Map(counts.map((c) => [c.category, c.count]));

  return (
    <div className="community-categories">
      {Object.values(COMMUNITY_CATEGORIES).map((cat) => (
        <Link
          key={cat.slug}
          href={localePath(locale, `/c/${cat.slug}/`)}
          className="community-categories__item"
        >
          <span>{cat.emoji} {cat.label}</span>
          <strong>{countMap.get(cat.slug) ?? 0}</strong>
        </Link>
      ))}
    </div>
  );
}
