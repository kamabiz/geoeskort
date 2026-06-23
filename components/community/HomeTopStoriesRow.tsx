import { CommunityPostCard } from '@/components/community/CommunityPostCard';
import type { PostWithAuthor } from '@/lib/community/posts';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import type { Locale } from '@/lib/i18n/types';

type Props = {
  locale: Locale;
  topStories: PostWithAuthor[];
  className?: string;
};

export function HomeTopStoriesRow({ locale, topStories, className }: Props) {
  const cd = getCommunityDict(locale);

  if (topStories.length === 0) return null;

  return (
    <div
      className={[
        'forum-featured-row',
        'home-hero-top-stories',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="forum-block__head">
        <h3>{cd.home.topStoriesCaps}</h3>
      </div>
      <div className="forum-featured-row__grid">
        {topStories.map((post) => (
          <CommunityPostCard
            key={post.id}
            post={post}
            locale={locale}
            headingLevel="h3"
            viewPath="history"
            showVotes={false}
            excerptLength={240}
            bodyPreview
          />
        ))}
      </div>
    </div>
  );
}
