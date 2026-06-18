import Link from 'next/link';
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
  author: { username: string } | null;
  replies?: CommentNode[];
};

type Props = {
  locale: Locale;
  postId: string;
  comments: CommentNode[];
};

function displayName(
  comment: { isAnonymous: boolean; author: { username: string } | null },
  anonymousLabel: string,
) {
  if (comment.isAnonymous || !comment.author) return anonymousLabel;
  return comment.author.username;
}

export function CommentThread({ locale, postId, comments }: Props) {
  const cd = getCommunityDict(locale);

  return (
    <section className="community-comments">
      <h2>{cd.comments.title}</h2>
      <form action={createComment} className="community-form community-form--compact">
        <input type="hidden" name="postId" value={postId} />
        <label>
          {cd.comments.add}
          <textarea name="body" required rows={3} placeholder={cd.comments.placeholder} />
        </label>
        <label className="community-form__check">
          <input type="checkbox" name="anonymous" />
          {cd.comments.anonymous}
        </label>
        <button type="submit" className="btn btn--primary">{cd.comments.post}</button>
      </form>

      <ul className="community-comments__list">
        {comments.map((comment) => (
          <li key={comment.id} className="community-comments__item">
            <div className="community-comments__head">
              <strong>
                {comment.author && !comment.isAnonymous ? (
                  <Link href={localePath(locale, `/u/${comment.author.username}/`)}>
                    {displayName(comment, cd.post.anonymous)}
                  </Link>
                ) : (
                  displayName(comment, cd.post.anonymous)
                )}
              </strong>
              <time>{formatDateKa(comment.createdAt.toISOString())}</time>
            </div>
            <p>{comment.body}</p>
            {(comment.replies ?? []).map((reply) => (
              <div key={reply.id} className="community-comments__reply">
                <div className="community-comments__head">
                  <strong>{displayName(reply, cd.post.anonymous)}</strong>
                  <time>{formatDateKa(reply.createdAt.toISOString())}</time>
                </div>
                <p>{reply.body}</p>
              </div>
            ))}
            <form action={createComment} className="community-form community-form--compact">
              <input type="hidden" name="postId" value={postId} />
              <input type="hidden" name="parentId" value={comment.id} />
              <label>
                {cd.comments.reply}
                <textarea name="body" required rows={2} />
              </label>
              <button type="submit" className="btn btn--ghost">{cd.comments.reply}</button>
            </form>
          </li>
        ))}
      </ul>
    </section>
  );
}
