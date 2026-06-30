import Link from 'next/link';
import { CommunityAvatar } from '@/components/community/CommunityAvatar';
import { getCommunityCategoryLabel, getCommunityPostViewPath } from '@/lib/community/categories';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { localePath } from '@/lib/i18n/paths';
import { formatDateKa } from '@/lib/format-date';
import type { Locale } from '@/lib/i18n/types';

type CommentItem = {
  id: string;
  body: string;
  createdAt: Date;
  isAnonymous: boolean;
  author: { username: string; avatar: string | null } | null;
  post: { id: string; title: string; category: string; slug: string };
};

type Props = {
  locale: Locale;
  comments: CommentItem[];
  variant?: 'default' | 'modern';
};

export function LatestCommentsSidebar({ locale, comments, variant = 'default' }: Props) {
  const cd = getCommunityDict(locale);
  const className = variant === 'modern' ? 'forum-panel' : 'community-sidebar';

  const displayCommentUser = (comment: CommentItem) =>
    comment.isAnonymous || !comment.author ? cd.post.anonymous : comment.author.username;

  return (
    <aside className={className}>
      <h3 className="forum-panel__title">{cd.comments.latestCaps}</h3>
      {comments.length === 0 ? (
        <p className="forum-panel__empty">{cd.comments.empty}</p>
      ) : (
        <ul className="forum-panel__comments">
          {comments.map((comment) => (
            <li key={comment.id}>
              <Link href={localePath(locale, getCommunityPostViewPath(comment.post.category, comment.post.slug))}>
                <span className="forum-panel__comment-user">
                  <CommunityAvatar
                    username={displayCommentUser(comment)}
                    avatar={comment.isAnonymous ? null : comment.author?.avatar}
                    size="xs"
                  />
                  {displayCommentUser(comment)}
                </span>
                <span className="forum-panel__comment-body">{comment.body.slice(0, 80)}</span>
                <span className="forum-panel__comment-meta">
                  {getCommunityCategoryLabel(comment.post.category)} · {formatDateKa(comment.createdAt.toISOString())}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
