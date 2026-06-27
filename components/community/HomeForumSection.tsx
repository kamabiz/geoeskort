import Link from 'next/link';
import { HomeCategoriesPanel } from '@/components/community/HomeCategoriesPanel';
import { CommunityPostCard } from '@/components/community/CommunityPostCard';
import { ForumScrollRow } from '@/components/community/ForumScrollRow';
import { LatestCommentsSidebar } from '@/components/community/LatestCommentsSidebar';
import { OnlineMembersSidebar } from '@/components/community/OnlineMembersSidebar';
import { PointsLeaderboardSidebar } from '@/components/community/PointsLeaderboardSidebar';
import type { PostWithAuthor } from '@/lib/community/posts';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';

type CommentItem = {
  id: string;
  body: string;
  createdAt: Date;
  isAnonymous: boolean;
  author: { username: string; avatar: string | null } | null;
  post: { id: string; title: string; category: string };
};

type Props = {
  locale: Locale;
  latestPosts: PostWithAuthor[];
  randomPosts: PostWithAuthor[];
  categoryCounts: { category: string; count: number }[];
  presence: {
    totalMembers: number;
    onlineCount: number;
    onlineMembers: {
      id: string;
      username: string;
      avatar: string | null;
      isPremium: boolean;
    }[];
  };
  latestComments: CommentItem[];
  topLeaders: {
    id: string;
    username: string;
    avatar: string | null;
    points: number;
    isPremium: boolean;
  }[];
};

export function HomeForumSection({
  locale,
  latestPosts,
  randomPosts,
  categoryCounts,
  presence,
  latestComments,
  topLeaders,
}: Props) {
  const cd = getCommunityDict(locale);

  return (
    <section className="forum-hub forum-hub--compact">
      <div className="container">
        <div className="forum-hub__layout">
          <div className="forum-hub__latest forum-block forum-hub__latest--full">
            <div className="forum-block__head">
              <h3>{cd.home.latestStoriesCaps}</h3>
              <Link href={localePath(locale, '/submit/')}>{cd.home.writeYours}</Link>
            </div>
            {latestPosts.length === 0 ? (
              <p className="forum-empty">
                {cd.home.noStories}{' '}
                <Link href={localePath(locale, '/submit/')}>{cd.home.beFirst}</Link>
              </p>
            ) : (
              <ForumScrollRow itemCount={latestPosts.length}>
                {latestPosts.map((post) => (
                  <CommunityPostCard
                    key={post.id}
                    post={post}
                    locale={locale}
                    viewPath="history"
                    showVotes={false}
                    excerptLength={240}
                    bodyPreview
                  />
                ))}
              </ForumScrollRow>
            )}
          </div>

          <div className="forum-hub__lower">
            {randomPosts.length > 0 && (
              <div className="forum-hub__lower-head forum-block__head forum-desktop-only">
                <h3>{cd.home.randomPicksCaps}</h3>
              </div>
            )}

            <div className="forum-hub__lower-body">
              <div className="forum-hub__main-lower">
                {randomPosts.length > 0 && (
                  <div className="forum-grid forum-desktop-only">
                    {randomPosts.map((post) => (
                      <CommunityPostCard key={post.id} post={post} locale={locale} viewPath="history" showVotes={false} excerptLength={160} bodyPreview />
                    ))}
                  </div>
                )}
              </div>

              <div className="forum-hub__aside-track">
                <aside className="forum-hub__aside">
                  <OnlineMembersSidebar
                    locale={locale}
                    onlineMembers={presence.onlineMembers}
                    variant="modern"
                  />
                  <div className="forum-sidebar-stack">
                    <LatestCommentsSidebar locale={locale} comments={latestComments} variant="modern" />
                    <PointsLeaderboardSidebar locale={locale} leaders={topLeaders} variant="modern" limit={5} />
                  </div>
                </aside>
              </div>
            </div>
          </div>

          <HomeCategoriesPanel
            locale={locale}
            categoryCounts={categoryCounts}
            className="forum-mobile-only"
            mobileCollapsedCount={6}
          />
        </div>
      </div>
    </section>
  );
}
