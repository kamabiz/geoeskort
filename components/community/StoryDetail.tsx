import Link from 'next/link';
import { CommentThread } from '@/components/community/CommentThread';
import { PremiumLockedBody } from '@/components/community/PremiumLockedBody';
import { VoteColumn } from '@/components/community/VoteColumn';
import {
  getCommunityCategoryEmoji,
  getCommunityCategoryLabel,
  getCommunityPostListPath,
  getStoryViewPath,
} from '@/lib/community/categories';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { displayAuthor, type PostWithAuthor } from '@/lib/community/posts';
import { renderPostBody } from '@/lib/community/text';
import { formatDateKa } from '@/lib/format-date';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';

type CommentNode = {
  id: string;
  body: string;
  createdAt: Date;
  isAnonymous: boolean;
  parentId: string | null;
  authorId: string | null;
  author: { id: string; username: string; avatar: string | null } | null;
  replies?: CommentNode[];
  _count?: { upvotes: number };
};

type Props = {
  locale: Locale;
  post: PostWithAuthor;
  comments: CommentNode[];
  canView: boolean;
  backHref?: string;
  isLoggedIn: boolean;
  currentUserId?: string | null;
  hasUpvoted?: boolean;
  upvotedCommentIds?: Set<string>;
};

export function StoryDetail({
  locale,
  post,
  comments,
  canView,
  backHref,
  isLoggedIn,
  currentUserId = null,
  hasUpvoted = false,
  upvotedCommentIds = new Set(),
}: Props) {
  const cd = getCommunityDict(locale);
  const back = backHref ?? localePath(locale, getCommunityPostListPath(post.category));
  const categoryEmoji = getCommunityCategoryEmoji(post.category);
  const authorName = displayAuthor(post, cd.post.anonymous);
  const showAuthorLink = !post.isAnonymous && !!post.author;
  const upvoteCount = post._count?.upvotes ?? 0;
  const commentCount = post._count?.comments ?? comments.length;

  return (
    <main className="container community-page">
      <article className="post-wrap reddit-post">
        <Link href={back} className="post-back">
          {cd.post.back} {getCommunityCategoryLabel(post.category)}
        </Link>

        <div className="reddit-post__row">
          <VoteColumn
            postId={post.id}
            score={upvoteCount}
            hasUpvoted={hasUpvoted}
            isLoggedIn={isLoggedIn}
            locale={locale}
          />
          <div className="reddit-post__main">
            <div className="reddit-meta">
              <Link href={back} className="reddit-meta__sub">
                <span aria-hidden>{categoryEmoji}</span>
                {getCommunityCategoryLabel(post.category)}
              </Link>
              <span className="reddit-meta__sep" aria-hidden>
                ·
              </span>
              <span className="reddit-meta__author">
                {showAuthorLink ? (
                  <Link href={localePath(locale, `/u/${post.author!.username}/`)}>u/{authorName}</Link>
                ) : (
                  <span>u/{authorName}</span>
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

            <h1 className="post-title post-title--reddit">{post.title}</h1>

            {post.tags.length > 0 && (
              <div className="post-tags">
                {post.tags.map((tag) => (
                  <span key={tag} className="post-tag reddit-flair">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {canView ? (
              <div
                className="post-content post-content--reddit"
                dangerouslySetInnerHTML={{ __html: renderPostBody(post.body) }}
              />
            ) : (
              <PremiumLockedBody locale={locale} />
            )}

            <div className="reddit-actions">
              <span className="reddit-actions__item">
                💬 {commentCount} {cd.post.commentsLabel}
              </span>
              <span className="reddit-actions__item">
                👁 {post.viewCount} {cd.post.views}
              </span>
              <span className="reddit-actions__item">
                {post.readingTimeMinutes} {cd.post.minRead}
              </span>
            </div>

            <CommentThread
              locale={locale}
              postId={post.id}
              comments={comments}
              commentCount={commentCount}
              isLoggedIn={isLoggedIn}
              currentUserId={currentUserId}
              upvotedCommentIds={upvotedCommentIds}
            />
          </div>
        </div>
      </article>
    </main>
  );
}

export function storyDetailPath(slug: string): string {
  return getStoryViewPath(slug);
}
