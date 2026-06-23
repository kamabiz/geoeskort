import type { ReactNode } from 'react';
import Link from 'next/link';
import { VoteColumn } from '@/components/community/VoteColumn';
import {
  getCommunityCategoryEmoji,
  getCommunityCategoryLabel,
  getCommunityPostViewPath,
  getStoryViewPath,
} from '@/lib/community/categories';
import { makeExcerpt } from '@/lib/community/text';
import { displayAuthor, type PostWithAuthor } from '@/lib/community/posts';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { localePath } from '@/lib/i18n/paths';
import { formatDateKa } from '@/lib/format-date';
import type { Locale } from '@/lib/i18n/types';

type Props = {
  post: PostWithAuthor;
  locale: Locale;
  headingLevel?: 'h2' | 'h3';
  variant?: 'default' | 'featured' | 'compact';
  viewPath?: 'history' | 'questions' | 'default';
  isLoggedIn?: boolean;
  showVotes?: boolean;
};

export function CommunityPostCard({
  post,
  locale,
  headingLevel = 'h3',
  variant = 'default',
  viewPath = 'default',
  isLoggedIn = false,
  showVotes = true,
}: Props) {
  const cd = getCommunityDict(locale);
  const href =
    viewPath === 'history'
      ? localePath(locale, getStoryViewPath(post.id))
      : viewPath === 'questions'
        ? localePath(locale, `/questions/view/${post.id}/`)
        : localePath(locale, getCommunityPostViewPath(post.category, post.id));
  const author = displayAuthor(post, cd.post.anonymous);
  const showAuthorAvatar = !post.isAnonymous && !!post.author;
  const excerpt = makeExcerpt(post.body, variant === 'compact' ? 90 : 160);
  const TitleTag = headingLevel;
  const upvoteCount = post._count?.upvotes ?? 0;
  const commentCount = post._count?.comments ?? 0;
  const isFeatured = variant === 'featured';
  const isCompact = variant === 'compact';
  const categoryEmoji = getCommunityCategoryEmoji(post.category);

  if (isCompact) {
    return (
      <article className={`community-card community-card--reddit community-card--compact${showVotes ? '' : ' community-card--no-votes'}`}>
        {showVotes && (
          <VoteColumn
            postId={post.id}
            score={upvoteCount}
            isLoggedIn={isLoggedIn}
            locale={locale}
            size="sm"
          />
        )}
        <div className="community-card__body">
          <div className="community-card__compact-meta">
            <span className="community-card__cat-pill">
              <span className="community-card__cat-pill-emoji" aria-hidden>{categoryEmoji}</span>
              <span className="community-card__cat-pill-label">{getCommunityCategoryLabel(post.category)}</span>
            </span>
            {post.isPremium && (
              <span className="reddit-flair reddit-flair--premium">{cd.post.premium}</span>
            )}
          </div>

          <TitleTag className="community-card__title community-card__title--compact">
            <Link href={href}>{post.title}</Link>
          </TitleTag>

          <div className="community-card__compact-foot">
            <span className="community-card__compact-meta-line">
              {showAuthorAvatar ? (
                <Link href={localePath(locale, `/u/${post.author!.username}/`)} className="community-card__author-link">
                  u/{author}
                </Link>
              ) : (
                <span>u/{author}</span>
              )}
              <span className="reddit-meta__sep" aria-hidden>·</span>
              <time dateTime={post.createdAt.toISOString()}>{formatDateKa(post.createdAt.toISOString())}</time>
            </span>

            <div className="community-card__compact-stats">
              <Link href={href} className="community-card__stat">
                <CardStatIcon><IconComment /></CardStatIcon>
                <span>{commentCount}</span>
              </Link>
              <span className="community-card__stat">
                <CardStatIcon><IconEye /></CardStatIcon>
                <span>{post.viewCount}</span>
              </span>
              <span className="community-card__stat">
                <CardStatIcon><IconClock /></CardStatIcon>
                <span>{post.readingTimeMinutes} {cd.post.minRead}</span>
              </span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={`community-card community-card--reddit community-card--${variant}${showVotes ? '' : ' community-card--no-votes'}`}>
      {showVotes && (
        <VoteColumn
          postId={post.id}
          score={upvoteCount}
          isLoggedIn={isLoggedIn}
          locale={locale}
          size="md"
        />
      )}
      <div className="community-card__body">
        <div className="reddit-meta reddit-meta--card">
          <span className="reddit-meta__sub reddit-meta__sub--static">
            {getCommunityCategoryLabel(post.category)}
          </span>
          <span className="reddit-meta__sep" aria-hidden>
            ·
          </span>
          <span className="reddit-meta__author">
            {showAuthorAvatar ? (
              <Link href={localePath(locale, `/u/${post.author!.username}/`)} className="community-card__author-link">
                u/{author}
              </Link>
            ) : (
              <span>u/{author}</span>
            )}
          </span>
          <span className="reddit-meta__sep" aria-hidden>
            ·
          </span>
          <time dateTime={post.createdAt.toISOString()}>{formatDateKa(post.createdAt.toISOString())}</time>
          {post.isPremium && (
            <>
              <span className="reddit-meta__sep" aria-hidden>
                ·
              </span>
              <span className="reddit-flair reddit-flair--premium">{cd.post.premium}</span>
            </>
          )}
        </div>

        <TitleTag className={`community-card__title${isFeatured ? ' community-card__title--featured' : ''}`}>
          <Link href={href}>{post.title}</Link>
        </TitleTag>

        <p className="community-card__excerpt">
            {post.isPremium ? cd.post.premiumPreview : excerpt}
        </p>

        <div className="reddit-actions reddit-actions--card">
          <Link href={href} className="reddit-actions__item reddit-actions__link">
            💬 {commentCount} {cd.post.commentsLabel}
          </Link>
          <span className="reddit-actions__item">
            👁 {post.viewCount} {cd.post.views}
          </span>
          <span className="reddit-actions__item">
            {post.readingTimeMinutes} {cd.post.minRead}
          </span>
        </div>
      </div>
    </article>
  );
}

function CardStatIcon({ children }: { children: ReactNode }) {
  return <span className="community-card__stat-icon">{children}</span>;
}

function IconComment() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function IconEye() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
