import Link from 'next/link';
import { isPremiumEnabled } from '@/lib/community/premium-config';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';

type Props = {
  locale: Locale;
};

export function PromoBannerPanel({ locale }: Props) {
  const cd = getCommunityDict(locale);
  const premiumOn = isPremiumEnabled();

  const title = premiumOn ? cd.home.premiumBannerTitle : cd.free.bannerTitleCaps;
  const btn = premiumOn ? cd.home.premiumBannerBtn : cd.free.bannerBtn;
  const href = premiumOn ? '/user/subscription/' : '/points/';
  const icon = premiumOn ? '👑' : '✨';

  const panelClass = [
    'forum-panel',
    premiumOn ? 'forum-panel--premium' : 'forum-panel--free',
  ].join(' ');

  return (
    <aside className={panelClass}>
      <h3 className="forum-panel__title">
        <span aria-hidden>{icon}</span> {title}
      </h3>
      {premiumOn ? (
        <p className="forum-panel__desc">{cd.home.premiumBannerDesc}</p>
      ) : (
        <>
          <p className="forum-panel__desc">{cd.free.sidebarIntro}</p>
          <ul className="forum-panel__perks">
            {cd.free.perks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </>
      )}
      <Link href={localePath(locale, href)} className="forum-panel__cta">
        {btn}
      </Link>
    </aside>
  );
}
