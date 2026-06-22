import Link from 'next/link';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';

type Props = {
  locale: Locale;
};

export function PromoBannerPanel({ locale }: Props) {
  const cd = getCommunityDict(locale);

  return (
    <aside className="forum-panel forum-panel--premium">
      <h3 className="forum-panel__title">
        <span aria-hidden>👑</span> {cd.home.premiumBannerTitle}
      </h3>
      <p className="forum-panel__desc">{cd.home.premiumBannerDesc}</p>
      <Link href={localePath(locale, '/user/subscription/')} className="forum-panel__cta">
        {cd.home.premiumBannerBtn}
      </Link>
    </aside>
  );
}
