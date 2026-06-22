import Link from 'next/link';
import { CategoryCountList } from '@/components/community/CategoryCountList';
import { CommunityPostCard } from '@/components/community/CommunityPostCard';
import { ForumScrollRow } from '@/components/community/ForumScrollRow';
import { ForumSidebarExtras } from '@/components/community/ForumSidebarExtras';
import { LatestCommentsSidebar } from '@/components/community/LatestCommentsSidebar';
import { OnlineMembersSidebar } from '@/components/community/OnlineMembersSidebar';
import { PromoBannerPanel } from '@/components/community/PromoBannerPanel';
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
          <div className="forum-hub__main">
            {topStory && (
              <div className="forum-featured forum-featured--hide-mobile">
                <div className="forum-featured__badge">🔥 {cd.home.topStory}</div>
                <CommunityPostCard post={topStory} locale={locale} headingLevel="h2" variant="featured" viewPath="history" />
              </div>
            )}

            <div className="forum-block">
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

            {randomPosts.length > 0 && (
              <div className="forum-block">
                <div className="forum-block__head">
                  <h3>{cd.home.randomPicks}</h3>
                </div>
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
              </div>
            )}

            <div className="forum-block">
              <div className="forum-block__head">
                <h3>{cd.home.categoriesCaps}</h3>
                <Link href={localePath(locale, '/history/')}>ყველა →</Link>
              </div>
              <CategoryCountList locale={locale} counts={categoryCounts} variant="chips" />
            </div>
          </div>

          <aside className="forum-hub__aside">
            <PromoBannerPanel locale={locale} />
            <OnlineMembersSidebar
              locale={locale}
              onlineMembers={presence.onlineMembers}
              variant="modern"
            />
            <LatestCommentsSidebar locale={locale} comments={latestComments} variant="modern" />
            <ForumSidebarExtras locale={locale} />
          </aside>
        </div>
      </div>
    </section>
  );
}
