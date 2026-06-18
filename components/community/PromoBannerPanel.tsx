import Link from 'next/link';
import { isPremiumEnabled } from '@/lib/community/premium-config';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';

type Props = {
  locale: Locale;
  variant?: 'sidebar' | 'hero';
};

export function PromoBannerPanel({ locale, variant = 'sidebar' }: Props) {
  const cd = getCommunityDict(locale);
  const premiumOn = isPremiumEnabled();

  const title = premiumOn ? cd.home.premiumBannerTitle : cd.free.bannerTitle;
  const desc = premiumOn ? cd.home.premiumBannerDesc : cd.free.bannerDesc;
  const btn = premiumOn ? cd.home.premiumBannerBtn : cd.free.bannerBtn;
  const href = premiumOn ? '/user/subscription/' : '/points/';
  const icon = premiumOn ? '👑' : '✨';

  if (variant === 'hero') {
    return (
      <Link
        href={localePath(locale, href)}
        className={`hero__promo-pill${premiumOn ? ' hero__promo-pill--premium' : ''}`}
      >
        <span className="hero__promo-pill-icon" aria-hidden>{icon}</span>
        <span className="hero__promo-pill-text">
          <strong>{title}</strong>
          <span>{btn}</span>
        </span>
      </Link>
    );
  }

  const panelClass = [
    'forum-panel',
    premiumOn ? 'forum-panel--premium' : 'forum-panel--free',
  ].join(' ');

  return (
    <aside className={panelClass}>
      <h3 className="forum-panel__title">
        {icon} {title}
      </h3>
      <p className="forum-panel__desc">{desc}</p>
      <Link href={localePath(locale, href)} className="forum-panel__cta">
        {btn}
      </Link>
    </aside>
  );
}
