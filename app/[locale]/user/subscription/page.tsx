import Link from 'next/link';
import { PremiumCheckoutButton } from '@/components/community/PremiumCheckoutButton';
import { RedeemPremiumButton } from '@/components/community/RedeemPremiumButton';
import { getCurrentUser } from '@/lib/community/auth';
import { isPremiumEnabled } from '@/lib/community/premium-config';
import { PREMIUM_POINTS_COST } from '@/lib/community/points';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { isLocale } from '@/lib/i18n/config';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';
import { pageMetadata } from '@/lib/seo';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ success?: string; canceled?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const cd = getCommunityDict(raw as Locale);
  const title = isPremiumEnabled() ? cd.premium.title : cd.free.title;
  const description = isPremiumEnabled() ? cd.premium.lead : cd.free.lead;
  return pageMetadata({ locale: raw as Locale, path: '/user/subscription/', title, description });
}

export default async function UserSubscriptionPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  const { success, canceled } = await searchParams;
  if (!isLocale(raw)) return null;
  const locale = raw as Locale;
  const cd = getCommunityDict(locale);
  const user = await getCurrentUser();
  const premiumOn = isPremiumEnabled();

  if (!premiumOn) {
    return (
      <main className="container community-page">
        <div className="community-premium-hero community-premium-hero--free">
          <span className="community-free-badge">{cd.free.badge}</span>
          <h1>{cd.free.title}</h1>
          <p>{cd.free.lead}</p>
          <ul className="community-premium-list">
            {cd.free.perks.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{cd.free.pointsNote}</p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            <Link href={localePath(locale, '/points/')} className="btn btn--primary">{cd.nav.points}</Link>
            <Link href={localePath(locale, '/leaderboard/')} className="btn btn--ghost">{cd.points.leaderboard}</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container community-page">
      <div className="community-premium-hero">
        <h1>{cd.premium.title}</h1>
        <p>{cd.premium.lead}</p>
        <p><strong>{cd.premium.price}</strong></p>
        {success && <p className="community-form__success">{cd.premium.success}</p>}
        {canceled && <p className="community-form__error">{cd.premium.canceled}</p>}
        {!user ? (
          <p><Link href={localePath(locale, '/login/')} className="btn btn--primary">{cd.premium.loginToSubscribe}</Link></p>
        ) : user.isPremium ? (
          <p>{cd.premium.alreadyMember}</p>
        ) : (
          <>
            <PremiumCheckoutButton label={cd.premium.title} />
            <RedeemPremiumButton label={cd.premium.redeemWithPoints} userPoints={user.points} cost={PREMIUM_POINTS_COST} />
          </>
        )}

        <h2 style={{ marginTop: '2rem' }}>{cd.points.freeTier}</h2>
        <ul className="community-premium-list">
          {cd.premium.freePerks.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {cd.premium.lockedPerks.join(' · ')}
        </p>

        <h2 style={{ marginTop: '2rem' }}>{cd.points.premiumTier}</h2>
        <ul className="community-premium-list">
          {cd.premium.perks.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>
    </main>
  );
}
