import Link from 'next/link';
import { getLeaderboard } from '@/lib/community/points';
import { safeCommunity } from '@/lib/community/safe';
import { isLocale } from '@/lib/i18n/config';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  return pageMetadata({
    locale: raw as Locale,
    path: '/leaderboard/',
    title: 'Leaderboard',
    description: 'Top community members by karma points',
  });
}

export default async function LeaderboardPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return null;
  const locale = raw as Locale;

  const leaders = await safeCommunity(() => getLeaderboard(50), []);

  return (
    <main className="container community-page">
      <h1>Leaderboard</h1>
      <table className="community-leaderboard">
        <thead>
          <tr>
            <th>#</th>
            <th>Member</th>
            <th>Points</th>
            <th>Stories</th>
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
