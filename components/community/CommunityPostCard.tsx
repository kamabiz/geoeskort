import Link from 'next/link';
import { getCommunityCategoryLabel } from '@/lib/community/categories';
import { makeExcerpt } from '@/lib/community/text';
import { displayAuthor, type PostWithAuthor } from '@/lib/community/posts';
import { localePath } from '@/lib/i18n/paths';
import { formatDateKa } from '@/lib/format-date';
import type { Locale } from '@/lib/i18n/types';

type Props = {
  post: PostWithAuthor;
  locale: Locale;
  headingLevel?: 'h2' | 'h3';
};

export function CommunityPostCard({ post, locale, headingLevel = 'h3' }: Props) {
  const href = localePath(locale, `/p/${post.id}/`);
  const author = displayAuthor(post);
  const excerpt = makeExcerpt(post.body);
  const TitleTag = headingLevel;

  return (
    <article className="community-card">
      <div className="community-card__meta">
        <span className="community-card__cat">{getCommunityCategoryLabel(post.category)}</span>
        {post.isPremium && <span className="community-card__premium">Premium</span>}
        <time dateTime={post.createdAt.toISOString()}>{formatDateKa(post.createdAt.toISOString())}</time>
      </div>
      <TitleTag className="community-card__title">
        <Link href={href}>{post.title}</Link>
      </TitleTag>
      <p className="community-card__excerpt">
        {post.isPremium ? '🔒 Premium story — members only preview' : excerpt}
      </p>
      <div className="community-card__footer">
        <span>{author}</span>
        <span>{post.viewCount} views</span>
        <span>{post.readingTimeMinutes} min</span>
      </div>
    </article>
  );
}
