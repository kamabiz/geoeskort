import Link from 'next/link';
import { createComment } from '@/lib/community/actions';
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

function displayName(comment: { isAnonymous: boolean; author: { username: string } | null }) {
  if (comment.isAnonymous || !comment.author) return 'Anonymous';
  return comment.author.username;
}

export function CommentThread({ locale, postId, comments }: Props) {
  return (
    <section className="community-comments">
      <h2>Comments</h2>
      <form action={createComment} className="community-form community-form--compact">
        <input type="hidden" name="postId" value={postId} />
        <label>
          Add a comment
          <textarea name="body" required rows={3} placeholder="Share your thoughts..." />
        </label>
        <label className="community-form__check">
          <input type="checkbox" name="anonymous" />
          Comment anonymously
        </label>
        <button type="submit" className="btn btn--primary">Post comment</button>
      </form>

      <ul className="community-comments__list">
        {comments.map((comment) => (
          <li key={comment.id} className="community-comments__item">
            <div className="community-comments__head">
              <strong>
                {comment.author && !comment.isAnonymous ? (
                  <Link href={localePath(locale, `/u/${comment.author.username}/`)}>
                    {displayName(comment)}
                  </Link>
                ) : (
                  displayName(comment)
                )}
              </strong>
              <time>{formatDateKa(comment.createdAt.toISOString())}</time>
            </div>
            <p>{comment.body}</p>
            {(comment.replies ?? []).map((reply) => (
              <div key={reply.id} className="community-comments__reply">
                <div className="community-comments__head">
                  <strong>{displayName(reply)}</strong>
                  <time>{formatDateKa(reply.createdAt.toISOString())}</time>
                </div>
                <p>{reply.body}</p>
              </div>
            ))}
            <form action={createComment} className="community-form community-form--compact">
              <input type="hidden" name="postId" value={postId} />
              <input type="hidden" name="parentId" value={comment.id} />
              <label>
                Reply
                <textarea name="body" required rows={2} />
              </label>
              <button type="submit" className="btn btn--ghost">Reply</button>
            </form>
          </li>
        ))}
      </ul>
    </section>
  );
}
