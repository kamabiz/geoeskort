import Link from 'next/link';
import { CommunityAvatar } from '@/components/community/CommunityAvatar';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';

type Leader = {
  id: string;
  username: string;
  avatar: string | null;
  points: number;
  isPremium: boolean;
};

type Props = {
  locale: Locale;
  leaders: Leader[];
  variant?: 'default' | 'modern';
};

export function PointsLeaderboardSidebar({ locale, leaders, variant = 'default' }: Props) {
  const cd = getCommunityDict(locale);
  const className = variant === 'modern' ? 'forum-panel forum-panel--points' : 'community-sidebar';

  return (
    <aside className={className}>
      <h3 className="forum-panel__title">🏆 {cd.home.pointsTopCaps}</h3>
      {leaders.length === 0 ? (
        <p className="forum-panel__empty">{cd.home.leaderboardEmpty}</p>
      ) : (
        <>
          <ol className="forum-panel__leaderboard">
            {leaders.map((user, index) => (
              <li
                key={user.id}
                className={`forum-panel__leader${index < 3 ? ` forum-panel__leader--top${index + 1}` : ''}`}
              >
                <Link href={localePath(locale, `/u/${user.username}/`)}>
                  <span className="forum-panel__rank" aria-hidden>
                    {index + 1}
                  </span>
                  <CommunityAvatar
                    username={user.username}
                    avatar={user.avatar}
                    size="xs"
                    className="forum-panel__avatar"
                  />
                  <span className="forum-panel__leader-info">
                    <span className="forum-panel__name">@{user.username}</span>
                    <span className="forum-panel__points">
                      {user.points.toLocaleString('ka-GE')} {cd.user.points.toLowerCase()}
                    </span>
                  </span>
                  {user.isPremium && <span className="forum-panel__badge">👑</span>}
                </Link>
              </li>
            ))}
          </ol>
          <Link href={localePath(locale, '/leaderboard/')} className="forum-panel__link-more">
            {cd.home.viewLeaderboard}
          </Link>
        </>
      )}
    </aside>
  );
}
