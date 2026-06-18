import Link from 'next/link';
import { getLeaderboard } from '@/lib/community/points';
import { safeCommunity } from '@/lib/community/safe';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { isLocale } from '@/lib/i18n/config';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const cd = getCommunityDict(raw as Locale);
  return pageMetadata({ locale: raw as Locale, path: '/leaderboard/', title: cd.points.leaderboard, description: cd.points.lead });
}

export default async function LeaderboardPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return null;
  const locale = raw as Locale;
  const cd = getCommunityDict(locale);

  const leaders = await safeCommunity(() => getLeaderboard(50), []);

  return (
    <main className="container community-page">
      <h1>{cd.points.leaderboard}</h1>
      <table className="community-leaderboard">
        <thead>
          <tr>
            <th>#</th>
            <th>მომხმარებელი</th>
            <th>{cd.user.points}</th>
            <th>{cd.user.stories}</th>
          </tr>
        </thead>
        <tbody>
          {leaders.map((user, index) => (
            <tr key={user.id}>
              <td>{index + 1}</td>
              <td>
                <Link href={localePath(locale, `/u/${user.username}/`)}>
                  @{user.username}
                  {user.isPremium && ' 👑'}
                </Link>
              </td>
              <td>{user.points}</td>
              <td>{user._count.posts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
