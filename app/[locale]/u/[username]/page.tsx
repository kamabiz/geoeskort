import Link from 'next/link';
import { CommunityAvatar } from '@/components/community/CommunityAvatar';
import { notFound } from 'next/navigation';
import { CommunityPostCard } from '@/components/community/CommunityPostCard';
import { CommunityLogoutButton } from '@/components/community/CommunityLogoutButton';
import { getCurrentUser } from '@/lib/community/auth';
import { getUserProfile } from '@/lib/community/posts';
import { safeCommunity } from '@/lib/community/safe';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { isLocale } from '@/lib/i18n/config';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string; username: string }> };

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props) {
  const { locale: raw, username } = await params;
  if (!isLocale(raw)) return {};
  return pageMetadata({
    locale: raw as Locale,
    path: `/u/${username}/`,
    title: `@${username}`,
    description: `პროფილი — ${username}`,
  });
}

export default async function UserProfilePage({ params }: Props) {
  const { locale: raw, username } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const cd = getCommunityDict(locale);

  const profile = await safeCommunity(() => getUserProfile(username.toLowerCase()), null);
  if (!profile) notFound();
  const currentUser = await getCurrentUser();
  const isOwnProfile = currentUser?.username === profile.username;

  return (
    <main className="container community-page">
      <header className="community-profile">
        <CommunityAvatar username={profile.username} avatar={profile.avatar} size="lg" />
        <div>
          <h1>@{profile.username}</h1>
          {profile.isPremium && <span className="community-card__premium">{cd.user.premium}</span>}
          <p>{profile.bio || '—'}</p>
          <ul className="community-profile__stats">
            <li><strong>{profile.points}</strong> {cd.user.points}</li>
            <li><strong>{profile._count.posts}</strong> {cd.user.stories}</li>
            <li><strong>{profile._count.comments}</strong> {cd.user.comments}</li>
          </ul>
          <p style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {isOwnProfile && (
              <>
                <Link href={localePath(locale, '/user/dating/')} className="btn btn--ghost">{cd.user.dating}</Link>
                <Link href={localePath(locale, '/user/settings/')} className="btn btn--ghost">{cd.user.settings}</Link>
                <Link href={localePath(locale, '/user/subscription/')} className="btn btn--ghost">{cd.user.subscription}</Link>
                <CommunityLogoutButton locale={locale} label={cd.auth.logout} className="btn btn--ghost community-logout-btn" />
              </>
            )}
          </p>
        </div>
      </header>

      <section>
        <h2>{cd.user.stories}</h2>
        <div className="community-grid">
          {profile.posts.length === 0 ? (
            <p className="community-sidebar__empty">{cd.history.noStories}</p>
          ) : (
            profile.posts.map((post) => (
              <CommunityPostCard key={post.id} post={post} locale={locale} viewPath="history" />
            ))
          )}
        </div>
      </section>

      <p>
        <Link href={localePath(locale, '/leaderboard/')} className="btn btn--ghost">{cd.points.leaderboard} →</Link>
      </p>
    </main>
  );
}
