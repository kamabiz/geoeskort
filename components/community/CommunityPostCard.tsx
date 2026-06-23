import Link from 'next/link';
import { CommunityAvatar } from '@/components/community/CommunityAvatar';
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
};

export function CommunityPostCard({
  post,
  locale,
  headingLevel = 'h3',
  variant = 'default',
  viewPath = 'default',
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

  return (
    <article className={`community-card community-card--${variant}`}>
      <div className="community-card__meta">
        <span className="community-card__cat">
          <span className="community-card__cat-emoji" aria-hidden>{categoryEmoji}</span>
          {getCommunityCategoryLabel(post.category)}
        </span>
        {post.isPremium && <span className="community-card__premium">{cd.post.premium}</span>}
        <time dateTime={post.createdAt.toISOString()}>{formatDateKa(post.createdAt.toISOString())}</time>
      </div>
      <TitleTag className="community-card__title">
        <Link href={href}>{post.title}</Link>
      </TitleTag>
      {variant !== 'compact' && (
        <p className="community-card__excerpt">
          {post.isPremium ? cd.post.premiumPreview : excerpt}
        </p>
      )}
      <div className="community-card__footer">
        <span className="community-card__author">
          <CommunityAvatar
            username={showAuthorAvatar ? post.author?.username : cd.post.anonymous}
            avatar={showAuthorAvatar ? post.author?.avatar : null}
            size="xs"
          />
          {showAuthorAvatar ? (
            <Link href={localePath(locale, `/u/${post.author!.username}/`)} className="community-card__author-link">
              {author}
            </Link>
          ) : (
            <span className="community-card__author-name">{author}</span>
          )}
        </span>
        <span>{post.viewCount} {cd.post.views}</span>
        <span>{post.readingTimeMinutes} {cd.post.minRead}</span>
      </div>
    </article>
  );
}
