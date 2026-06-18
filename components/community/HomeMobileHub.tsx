import Link from 'next/link';
import { STORY_CATEGORY_SLUGS, getStoryViewPath } from '@/lib/community/categories';
import type { PostWithAuthor } from '@/lib/community/posts';
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
};

const HUB_MODULES = [
  { key: 'history', href: '/history/', icon: '📚', labelKey: 'history' as const, countFrom: 'stories' as const },
  { key: 'conversation', href: '/conversationRoom/', icon: '🗣️', labelKey: 'conversation' as const, countFrom: 'online' as const },
  { key: 'questions', href: '/questions/', icon: '❓', labelKey: 'questions' as const, slug: 'questions-advice' as const },
  { key: 'crush', href: '/crush/', icon: '💕', labelKey: 'crush' as const, slug: 'dating-crush' as const },
];

export function HomeMobileHub({
  locale,
  user,
  topStory,
  latestPost,
  categoryCounts,
  onlineCount,
}: Props) {
  const cd = getCommunityDict(locale);
  const countMap = new Map(categoryCounts.map((c) => [c.category, c.count]));

  const storyTotal = STORY_CATEGORY_SLUGS.reduce(
    (sum, slug) => sum + (countMap.get(slug) ?? 0),
    0,
  );

  const moduleCount = (mod: (typeof HUB_MODULES)[number]) => {
    if (mod.countFrom === 'stories') return storyTotal;
    if (mod.countFrom === 'online') return onlineCount;
    if (mod.slug) return countMap.get(mod.slug) ?? 0;
    return 0;
  };

  const moduleLabel = (key: (typeof HUB_MODULES)[number]['labelKey']) => cd.nav[key];

  return (
    <div className="home-mobile-hub">
      <div className="home-spotlight">
        {topStory ? (
          <Link
            href={localePath(locale, getStoryViewPath(topStory.id))}
            className="home-spotlight__item home-spotlight__item--top"
          >
            <span className="home-spotlight__icon" aria-hidden>🔥</span>
            <span className="home-spotlight__body">
              <strong>{cd.home.topStory}</strong>
              <span>{topStory.title}</span>
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
            href={localePath(locale, getStoryViewPath(latestPost.id))}
            className="home-spotlight__item home-spotlight__item--new"
          >
            <span className="home-spotlight__icon home-spotlight__icon--new" aria-hidden>✨</span>
            <span className="home-spotlight__body">
              <strong>{cd.home.newPost}</strong>
              <span>{latestPost.title}</span>
            </span>
            <span className="home-spotlight__arrow" aria-hidden>›</span>
          </Link>
        ) : null}
      </div>

      <div className="home-hub-card">
        <span className="home-hub-card__badge">{cd.home.badge}</span>
        <h1 className="home-hub-card__greeting">
          {cd.home.greetingHello},{' '}
          {user ? (
            <Link href={localePath(locale, `/u/${user.username}/`)} className="home-hub-card__user">
              @{user.username}
            </Link>
          ) : (
            <span className="home-hub-card__user home-hub-card__user--guest">@{cd.home.greetingGuest}</span>
          )}
        </h1>
        <p className="home-hub-card__lead">{cd.home.lead}</p>
        {!user && (
          <p className="home-hub-card__auth">
            {cd.home.greetingAuthHint}{' '}
            <Link href={localePath(locale, '/login/')}>{cd.home.greetingAuthLogin}</Link>
            {' / '}
            <Link href={localePath(locale, '/register/')}>{cd.home.greetingAuthRegister}</Link>
          </p>
        )}
        <div className="home-hub-card__actions">
          <Link href={localePath(locale, '/history/')} className="home-hub-card__btn home-hub-card__btn--primary">
            <span aria-hidden>📚</span>
            {cd.nav.history}
          </Link>
          <Link href={localePath(locale, '/conversationRoom/')} className="home-hub-card__btn home-hub-card__btn--ghost">
            <span aria-hidden>🗣️</span>
            {cd.nav.conversation}
          </Link>
        </div>
      </div>

      <nav className="home-module-grid" aria-label={cd.home.sidebarQuickTitle}>
        {HUB_MODULES.map((mod) => {
          const count = moduleCount(mod);
          return (
            <Link
              key={mod.key}
              href={localePath(locale, mod.href)}
              className="home-module-grid__item"
            >
              {count > 0 && (
                <span className="home-module-grid__badge">{count > 99 ? '99+' : count}</span>
              )}
              <span className="home-module-grid__icon-wrap">
                <span className="home-module-grid__icon" aria-hidden>{mod.icon}</span>
              </span>
              <span className="home-module-grid__label">{moduleLabel(mod.labelKey)}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
