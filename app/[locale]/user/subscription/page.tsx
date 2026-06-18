import Link from 'next/link';
import { PremiumCheckoutButton } from '@/components/community/PremiumCheckoutButton';
import { RedeemPremiumButton } from '@/components/community/RedeemPremiumButton';
import { getCurrentUser } from '@/lib/community/auth';
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
  return pageMetadata({ locale: raw as Locale, path: '/user/subscription/', title: cd.premium.title, description: cd.premium.lead });
}

export default async function UserSubscriptionPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  const { success, canceled } = await searchParams;
  if (!isLocale(raw)) return null;
  const locale = raw as Locale;
  const cd = getCommunityDict(locale);
  const user = await getCurrentUser();

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
