import Link from 'next/link';
import { HomeCategoriesPanel } from '@/components/community/HomeCategoriesPanel';
import { CommunityPostCard } from '@/components/community/CommunityPostCard';
import { ForumScrollRow } from '@/components/community/ForumScrollRow';
import { ForumSidebarExtras } from '@/components/community/ForumSidebarExtras';
import { LatestCommentsSidebar } from '@/components/community/LatestCommentsSidebar';
import { OnlineMembersSidebar } from '@/components/community/OnlineMembersSidebar';
import type { PostWithAuthor } from '@/lib/community/posts';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';

type CommentItem = {
  id: string;
  body: string;
  createdAt: Date;
  isAnonymous: boolean;
  author: { username: string } | null;
  post: { id: string; title: string; category: string };
};

type Props = {
  locale: Locale;
  topStory: PostWithAuthor | null;
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
};

export function HomeForumSection({
  locale,
  topStory,
  latestPosts,
  randomPosts,
  categoryCounts,
  presence,
  latestComments,
}: Props) {
  const cd = getCommunityDict(locale);

  return (
    <section className="forum-hub forum-hub--compact">
      <div className="container">
        <div className="forum-hub__layout">
          {topStory && (
            <div className="forum-hub__featured forum-featured forum-featured--hide-mobile">
              <div className="forum-featured__badge">🔥 {cd.home.topStory}</div>
              <CommunityPostCard post={topStory} locale={locale} headingLevel="h2" variant="featured" viewPath="history" />
            </div>
          )}

          <div className="forum-hub__latest forum-block">
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
                  <CommunityPostCard key={post.id} post={post} locale={locale} variant="compact" viewPath="history" />
                ))}
              </ForumScrollRow>
            )}
          </div>

          <div className="forum-hub__lower">
            {randomPosts.length > 0 && (
              <div className="forum-hub__lower-head forum-block__head">
                <h3>{cd.home.randomPicksCaps}</h3>
              </div>
            )}

            <div className="forum-hub__main-lower">
              {randomPosts.length > 0 && (
                <>
                  <div className="forum-grid forum-desktop-only">
                    {randomPosts.map((post) => (
                      <CommunityPostCard key={post.id} post={post} locale={locale} viewPath="history" />
                    ))}
                  </div>
                  <div className="forum-mobile-only">
                    <ForumScrollRow itemCount={randomPosts.length}>
                      {randomPosts.map((post) => (
                        <CommunityPostCard key={post.id} post={post} locale={locale} viewPath="history" />
                      ))}
                    </ForumScrollRow>
                  </div>
                </>
              )}
            </div>

            <aside className="forum-hub__aside">
              <OnlineMembersSidebar
                locale={locale}
                onlineMembers={presence.onlineMembers}
                variant="modern"
              />
              <LatestCommentsSidebar locale={locale} comments={latestComments} variant="modern" />
              <ForumSidebarExtras locale={locale} />
            </aside>
          </div>

          <HomeCategoriesPanel
            locale={locale}
            categoryCounts={categoryCounts}
            className="forum-mobile-only"
          />
        </div>
      </div>
    </section>
  );
}
