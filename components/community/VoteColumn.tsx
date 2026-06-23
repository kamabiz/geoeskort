import Link from 'next/link';
import { upvoteComment, upvotePost } from '@/lib/community/actions';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';

type Props = {
  postId: string;
  commentId?: string;
  score: number;
  hasUpvoted?: boolean;
  isLoggedIn: boolean;
  locale: Locale;
  size?: 'sm' | 'md';
};

export function VoteColumn({
  postId,
  commentId,
  score,
  hasUpvoted = false,
  isLoggedIn,
  locale,
  size = 'md',
}: Props) {
  const cd = getCommunityDict(locale);
  const upClass = `vote-col__btn vote-col__btn--up${hasUpvoted ? ' vote-col__btn--active' : ''}`;
  const upvoteAction = commentId
    ? upvoteComment.bind(null, commentId, postId)
    : upvotePost.bind(null, postId);

  return (
    <div className={`vote-col vote-col--${size}`} aria-label={cd.post.upvote}>
      {isLoggedIn ? (
        hasUpvoted ? (
          <span className={upClass} aria-label={cd.post.upvoted}>
            ▲
          </span>
        ) : (
          <form action={upvoteAction}>
            <button type="submit" className={upClass} aria-label={cd.post.upvote}>
              ▲
            </button>
          </form>
        )
      ) : (
        <Link
          href={localePath(locale, '/login/')}
          className={upClass}
          aria-label={cd.post.upvoteLogin}
          title={cd.post.upvoteLogin}
        >
          ▲
        </Link>
      )}
      <span className="vote-col__score">{score}</span>
      <span className="vote-col__btn vote-col__btn--down" aria-hidden="true">
        ▼
      </span>
    </div>
  );
}
