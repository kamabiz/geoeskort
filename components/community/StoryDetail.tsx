import Link from 'next/link';
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
  author: { username: string } | null;
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
          <p className="post-excerpt">{cd.post.by} {displayAuthor(post, cd.post.anonymous)}</p>
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
      </article>
      <CommentThread locale={locale} postId={post.id} comments={comments} />
    </main>
  );
}

export function storyDetailPath(id: string): string {
  return getStoryViewPath(id);
}
