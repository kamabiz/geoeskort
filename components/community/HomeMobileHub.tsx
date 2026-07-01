import Link from 'next/link';
import { STORY_CATEGORY_SLUGS, getStoryViewPath } from '@/lib/community/categories';
import type { PostWithAuthor } from '@/lib/community/posts';
import { makeBodyPreview } from '@/lib/community/text';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';
import type { User } from '@prisma/client';

type Props = {
  locale: Locale;
  user: User | null;
  topStory: PostWithAuthor | null;
  latestPost: PostWithAuthor | null;
  categoryCounts: { category: string; count: number }[];
  onlineCount: number;
  storyCount: number;
  memberCount: number;
};


export function HomeMobileHub({
  locale,
  user,
  topStory,
  latestPost,
  categoryCounts,
  onlineCount,
  storyCount,
  memberCount,
}: Props) {
  const cd = getCommunityDict(locale);
  const countMap = new Map(categoryCounts.map((c) => [c.category, c.count]));

  const storyTotal = STORY_CATEGORY_SLUGS.reduce(
    (sum, slug) => sum + (countMap.get(slug) ?? 0),
    0,
  );

  type HubModule = {
    key: string;
    href: string;
    icon: string;
    label: string;
    count: number;
  };

  const HUB_MODULES: HubModule[] = [
    { key: 'history',      href: '/history/',        icon: '📚', label: cd.nav.history,   count: storyTotal },
    { key: 'conversation', href: '/conversationRoom/', icon: '💬', label: cd.nav.chat,    count: onlineCount },
    { key: 'dating',       href: '/dating/',          icon: '💘', label: cd.nav.dating,   count: 0 },
    { key: 'questions',    href: '/questions/',       icon: '❓', label: cd.nav.questions, count: countMap.get('questions-advice') ?? 0 },
    { key: 'sexology',     href: '/medical/',         icon: '🩺', label: cd.nav.medical,  count: countMap.get('sexology') ?? 0 },
    { key: 'crush',        href: '/crush/',           icon: '💕', label: cd.nav.crush,    count: countMap.get('dating-crush') ?? 0 },
  ];

  const spotlightExcerpt = (post: PostWithAuthor) =>
    post.isPremium ? cd.post.premiumPreview : makeBodyPreview(post.body, post.title, 240);

  return (
    <div className="home-mobile-hub">
      <div className="home-spotlight">
        {topStory ? (
          <Link
            href={localePath(locale, getStoryViewPath(topStory.slug))}
            className="home-spotlight__item home-spotlight__item--top"
          >
            <span className="home-spotlight__icon" aria-hidden>🔥</span>
            <span className="home-spotlight__body">
              <strong>{cd.home.topStory}</strong>
              <span className="home-spotlight__title">{topStory.title}</span>
              <p className="home-spotlight__excerpt">{spotlightExcerpt(topStory)}</p>
            </span>
            <span className="home-spotlight__arrow" aria-hidden>›</span>
          </Link>
        ) : (
          <Link href={localePath(locale, '/history/')} className="home-spotlight__item home-spotlight__item--top">
            <span className="home-spotlight__icon" aria-hidden>🔥</span>
            <span className="home-spotlight__body">
              <strong>{cd.home.topStory}</strong>
              <span>{cd.home.noStories}</span>
            </span>
            <span className="home-spotlight__arrow" aria-hidden>›</span>
          </Link>
        )}

        {latestPost ? (
          <Link
            href={localePath(locale, getStoryViewPath(latestPost.slug))}
            className="home-spotlight__item home-spotlight__item--new"
          >
            <span className="home-spotlight__icon home-spotlight__icon--new" aria-hidden>✨</span>
            <span className="home-spotlight__body">
              <strong>{cd.home.newPost}</strong>
              <span className="home-spotlight__title">{latestPost.title}</span>
              <p className="home-spotlight__excerpt">{spotlightExcerpt(latestPost)}</p>
            </span>
            <span className="home-spotlight__arrow" aria-hidden>›</span>
          </Link>
        ) : null}
      </div>

      <nav className="home-module-grid" aria-label={cd.home.sidebarQuickTitle}>
        {HUB_MODULES.map((mod) => (
          <Link
            key={mod.key}
            href={localePath(locale, mod.href)}
            className="home-module-grid__item"
            data-module={mod.key}
          >
            {mod.count > 0 && (
              <span className="home-module-grid__badge">{mod.count > 99 ? '99+' : mod.count}</span>
            )}
            <span className="home-module-grid__icon-wrap">
              <span className="home-module-grid__icon" aria-hidden>{mod.icon}</span>
            </span>
            <span className="home-module-grid__label">{mod.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
