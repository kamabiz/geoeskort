import Link from 'next/link';
import { POINT_VALUES, PREMIUM_POINTS_COST } from '@/lib/community/points';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { isLocale } from '@/lib/i18n/config';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const cd = getCommunityDict(raw as Locale);
  return pageMetadata({ locale: raw as Locale, path: '/points/', title: cd.points.title, description: cd.points.lead });
}

export default async function PointsPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return null;
  const locale = raw as Locale;
  const cd = getCommunityDict(locale);

  return (
    <main className="container community-page">
      <h1>{cd.points.title}</h1>
      <p>{cd.points.lead}</p>
      <ul className="community-rules">
        <li><strong>+{POINT_VALUES.POST_PUBLISHED}</strong> — {cd.points.storyAdd}</li>
        <li><strong>+{POINT_VALUES.POST_REPORTED}</strong> — {cd.points.storyReport}</li>
        <li>{cd.points.redeemPremium}</li>
        <li>{cd.points.giftPoints}</li>
      </ul>
      <p><strong>{cd.points.freeTier}</strong></p>
      <p><strong>{cd.points.premiumTier}</strong> — {PREMIUM_POINTS_COST} ქულა / 30 დღე</p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
        <Link href={localePath(locale, '/leaderboard/')} className="btn btn--primary">{cd.points.leaderboard}</Link>
        <Link href={localePath(locale, '/user/subscription/')} className="btn btn--ghost">Premium</Link>
      </div>
    </main>
  );
}
