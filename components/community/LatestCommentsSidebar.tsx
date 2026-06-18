import Link from 'next/link';
import { getCommunityCategoryLabel } from '@/lib/community/categories';
import { localePath } from '@/lib/i18n/paths';
import { formatDateKa } from '@/lib/format-date';
import type { Locale } from '@/lib/i18n/types';

type CommentItem = {
  id: string;
  body: string;
  createdAt: Date;
  isAnonymous: boolean;
  author: { username: string } | null;
  post: { id: string; title: string; category: string };
};

type Props = {
  locale: Locale;
  comments: CommentItem[];
};

export function LatestCommentsSidebar({ locale, comments }: Props) {
  return (
    <aside className="community-sidebar">
      <h3 className="community-sidebar__title">Latest comments</h3>
      {comments.length === 0 ? (
        <p className="community-sidebar__empty">No comments yet.</p>
      ) : (
        <ul className="community-sidebar__list">
          {comments.map((comment) => (
            <li key={comment.id}>
              <Link href={localePath(locale, `/p/${comment.post.id}/`)}>
                <strong>{comment.isAnonymous || !comment.author ? 'Anonymous' : comment.author.username}</strong>
                <span className="community-sidebar__context">
                  {getCommunityCategoryLabel(comment.post.category)}: {comment.post.title.slice(0, 40)}
                </span>
                <span className="community-sidebar__body">{comment.body.slice(0, 100)}</span>
                <time>{formatDateKa(comment.createdAt.toISOString())}</time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
