import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CommunityPostCard } from '@/components/community/CommunityPostCard';
import { getUserProfile } from '@/lib/community/posts';
import { safeCommunity } from '@/lib/community/safe';
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
    description: `Profile for ${username}`,
  });
}

export default async function UserProfilePage({ params }: Props) {
  const { locale: raw, username } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  const profile = await safeCommunity(() => getUserProfile(username.toLowerCase()), null);
  if (!profile) notFound();

  return (
    <main className="container community-page">
      <header className="community-profile">
        <div className="community-avatar community-avatar--lg">
          {profile.avatar ? '🖼' : profile.username[0]?.toUpperCase()}
        </div>
        <div>
          <h1>@{profile.username}</h1>
          {profile.isPremium && <span className="community-card__premium">Premium</span>}
          <p>{profile.bio || 'No bio yet.'}</p>
          <ul className="community-profile__stats">
            <li><strong>{profile.points}</strong> points</li>
            <li><strong>{profile._count.posts}</strong> stories</li>
            <li><strong>{profile._count.comments}</strong> comments</li>
          </ul>
        </div>
      </header>

      <section>
        <h2>Stories</h2>
        <div className="community-grid">
          {profile.posts.length === 0 ? (
            <p className="community-sidebar__empty">No published stories yet.</p>
          ) : (
            profile.posts.map((post) => (
              <CommunityPostCard key={post.id} post={post} locale={locale} />
            ))
          )}
        </div>
      </section>

      <p>
        <Link href={localePath(locale, '/leaderboard/')} className="btn btn--ghost">View leaderboard →</Link>
      </p>
    </main>
  );
}
