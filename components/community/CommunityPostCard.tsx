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
  const categoryEmoji = getCommunityCategoryEmoji(post.category);
  const upvoteCount = post._count?.upvotes ?? 0;
  const commentCount = post._count?.comments ?? 0;
  const isFeatured = variant === 'featured';

  return (
    <article className={`community-card community-card--reddit community-card--${variant}${showVotes ? '' : ' community-card--no-votes'}`}>
      {showVotes && (
        <VoteColumn
          postId={post.id}
          score={upvoteCount}
          isLoggedIn={isLoggedIn}
          locale={locale}
          size={variant === 'compact' ? 'sm' : 'md'}
        />
      )}
      <div className="community-card__body">
        <div className="reddit-meta reddit-meta--card">
          <span className="reddit-meta__sub reddit-meta__sub--static">
            <span aria-hidden>{categoryEmoji}</span>
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

        {variant !== 'compact' && (
          <p className="community-card__excerpt">
            {post.isPremium ? cd.post.premiumPreview : excerpt}
          </p>
        )}

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
