import Link from 'next/link';
import { CommunityAvatar } from '@/components/community/CommunityAvatar';
import { VoteColumn } from '@/components/community/VoteColumn';
import { createComment } from '@/lib/community/actions';
import { getCommunityDict } from '@/lib/i18n/community-dict';
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
  _count?: { upvotes: number };
};

type Props = {
  locale: Locale;
  postId: string;
  comments: CommentNode[];
  commentCount?: number;
  isLoggedIn: boolean;
  upvotedCommentIds: Set<string>;
};

function displayName(
  comment: { isAnonymous: boolean; author: { username: string } | null },
  anonymousLabel: string,
) {
  if (comment.isAnonymous || !comment.author) return anonymousLabel;
  return comment.author.username;
}

function CommentBody({
  locale,
  postId,
  comment,
  cd,
  isLoggedIn,
  upvotedCommentIds,
  nested = false,
}: {
  locale: Locale;
  postId: string;
  comment: CommentNode;
  cd: ReturnType<typeof getCommunityDict>;
  isLoggedIn: boolean;
  upvotedCommentIds: Set<string>;
  nested?: boolean;
}) {
  const isPublicAuthor = !!comment.author && !comment.isAnonymous;
  const name = displayName(comment, cd.post.anonymous);

  return (
    <div className={`reddit-comment${nested ? ' reddit-comment--nested' : ''}`}>
      <div className="reddit-comment__vote">
        <VoteColumn
          postId={postId}
          commentId={comment.id}
          score={comment._count?.upvotes ?? 0}
          hasUpvoted={upvotedCommentIds.has(comment.id)}
          isLoggedIn={isLoggedIn}
          locale={locale}
          size="sm"
        />
      </div>
      <div className="reddit-comment__main">
        <div className="reddit-meta reddit-meta--comment">
          <span className="reddit-meta__author reddit-meta__author--comment">
            <CommunityAvatar
              username={isPublicAuthor ? comment.author?.username : cd.post.anonymous}
              avatar={isPublicAuthor ? comment.author?.avatar : null}
              size="xs"
            />
            {isPublicAuthor ? (
              <Link href={localePath(locale, `/u/${comment.author!.username}/`)}>u/{name}</Link>
            ) : (
              <span>u/{name}</span>
            )}
          </span>
          <span className="reddit-meta__sep" aria-hidden>
            ·
          </span>
          <time dateTime={comment.createdAt.toISOString()}>{formatDateKa(comment.createdAt.toISOString())}</time>
        </div>
        <p className="reddit-comment__body">{comment.body}</p>
        <details className="reddit-reply">
          <summary className="reddit-reply__toggle">{cd.comments.reply}</summary>
          <form action={createComment} className="community-form community-form--compact reddit-reply__form">
            <input type="hidden" name="postId" value={postId} />
            <input type="hidden" name="parentId" value={comment.id} />
            <label>
              <span className="visually-hidden">{cd.comments.reply}</span>
              <textarea name="body" required rows={2} placeholder={cd.comments.placeholder} />
            </label>
            <button type="submit" className="btn btn--ghost btn--sm">{cd.comments.reply}</button>
          </form>
        </details>
      </div>
    </div>
  );
}

export function CommentThread({
  locale,
  postId,
  comments,
  commentCount,
  isLoggedIn,
  upvotedCommentIds,
}: Props) {
  const cd = getCommunityDict(locale);
  const total = commentCount ?? comments.length;

  return (
    <section className="community-comments reddit-comments">
      <div className="reddit-comments__head">
        <h2>
          {total} {cd.post.commentsLabel}
        </h2>
      </div>

      {comments.length === 0 ? (
        <p className="reddit-comments__empty">{cd.comments.empty}</p>
      ) : (
        <div className="reddit-comments__list">
          {comments.map((comment) => (
            <article key={comment.id} className="reddit-comments__thread">
              <CommentBody
                locale={locale}
                postId={postId}
                comment={comment}
                cd={cd}
                isLoggedIn={isLoggedIn}
                upvotedCommentIds={upvotedCommentIds}
              />
              {(comment.replies ?? []).length > 0 && (
                <div className="reddit-comments__children">
                  {(comment.replies ?? []).map((reply) => (
                    <CommentBody
                      key={reply.id}
                      locale={locale}
                      postId={postId}
                      comment={reply}
                      cd={cd}
                      isLoggedIn={isLoggedIn}
                      upvotedCommentIds={upvotedCommentIds}
                      nested
                    />
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      <form action={createComment} className="community-form community-form--compact reddit-comment-form">
        <input type="hidden" name="postId" value={postId} />
        <label>
          {cd.comments.add}
          <textarea name="body" required rows={3} placeholder={cd.comments.placeholder} />
        </label>
        <div className="reddit-comment-form__actions">
          <label className="community-form__check">
            <input type="checkbox" name="anonymous" />
            {cd.comments.anonymous}
          </label>
          <button type="submit" className="btn btn--primary btn--sm">{cd.comments.post}</button>
        </div>
      </form>
    </section>
  );
}
