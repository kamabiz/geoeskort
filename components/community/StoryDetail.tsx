import Link from 'next/link';
import { CommunityAvatar } from '@/components/community/CommunityAvatar';
import { CommentThread } from '@/components/community/CommentThread';
import { PremiumLockedBody } from '@/components/community/PremiumLockedBody';
import {
  getCommunityCategoryEmoji,
  getCommunityCategoryLabel,
  getCommunityPostListPath,
  getStoryViewPath,
} from '@/lib/community/categories';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { canViewPremiumContent } from '@/lib/community/premium';
import { displayAuthor, type PostWithAuthor } from '@/lib/community/posts';
import { markdownToHtml } from '@/lib/community/text';
import { formatDateKa } from '@/lib/format-date';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';

type CommentNode = {
  id: string;
  body: string;
  createdAt: Date;
  isAnonymous: boolean;
  parentId: string | null;
  author: { username: string; avatar: string | null } | null;
  replies?: CommentNode[];
};

type Props = {
  locale: Locale;
  post: PostWithAuthor;
  comments: CommentNode[];
  canView: boolean;
  backHref?: string;
};

export function StoryDetail({ locale, post, comments, canView, backHref }: Props) {
  const cd = getCommunityDict(locale);
  const back = backHref ?? localePath(locale, getCommunityPostListPath(post.category));
  const categoryEmoji = getCommunityCategoryEmoji(post.category);
  const showAuthorAvatar = !post.isAnonymous && !!post.author;

  return (
    <main className="container community-page">
      <article className="post-wrap">
        <Link href={back} className="post-back">
          {cd.post.back} {categoryEmoji} {getCommunityCategoryLabel(post.category)}
        </Link>
        <header className="post-header">
          <div className="post-meta">
            <span className="post-cat">
              <span className="post-cat__emoji" aria-hidden>{categoryEmoji}</span>
              {getCommunityCategoryLabel(post.category)}
            </span>
            {post.isPremium && <span className="community-card__premium">{cd.post.premium}</span>}
            <time dateTime={post.createdAt.toISOString()}>{formatDateKa(post.createdAt.toISOString())}</time>
            <span>{post.viewCount} {cd.post.views}</span>
            <span>{post.readingTimeMinutes} {cd.post.minRead}</span>
          </div>
          <h1 className="post-title">{post.title}</h1>
          <p className="post-excerpt post-excerpt--author">
            <CommunityAvatar
              username={showAuthorAvatar ? post.author?.username : cd.post.anonymous}
              avatar={showAuthorAvatar ? post.author?.avatar : null}
              size="sm"
            />
            <span>{cd.post.by} </span>
            {showAuthorAvatar ? (
              <Link href={localePath(locale, `/u/${post.author!.username}/`)}>
                {displayAuthor(post, cd.post.anonymous)}
              </Link>
            ) : (
              <span>{displayAuthor(post, cd.post.anonymous)}</span>
            )}
          </p>
          {post.tags.length > 0 && (
            <div className="post-tags">
              {post.tags.map((tag) => (
                <span key={tag} className="post-tag">{tag}</span>
              ))}
            </div>
          )}
        </header>
        {canView ? (
          <div className="post-content" dangerouslySetInnerHTML={{ __html: markdownToHtml(post.body) }} />
        ) : (
          <PremiumLockedBody locale={locale} />
        )}
        <CommentThread locale={locale} postId={post.id} comments={comments} />
      </article>
    </main>
  );
}

export function storyDetailPath(id: string): string {
  return getStoryViewPath(id);
}
