import Link from 'next/link';
import { localePath } from '@/lib/i18n/paths';
import { getCategoryLabel } from '@/lib/blog-categories';
import type { Dictionary, Locale } from '@/lib/i18n/types';
import type { BlogPost } from '@/lib/types/blog';
import { formatDateKa } from '@/lib/format-date';

type BlogCardProps = {
  post: BlogPost;
  locale: Locale;
  dict: Dictionary;
  headingLevel?: 'h2' | 'h3';
};

export function BlogCard({ post, locale, dict, headingLevel = 'h2' }: BlogCardProps) {
  const href = localePath(locale, `/blog/${post.slug}/`);
  const title = <Link href={href}>{post.title}</Link>;

  return (
    <article className="blog-card">
      <Link href={href}>
        <div className="blog-card__thumb" aria-hidden={!!post.coverImage}>
          {post.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImage}
              alt=""
              className="blog-card__img"
              loading="lazy"
              decoding="async"
            />
          ) : (
            post.emoji
          )}
        </div>
      </Link>
      <div className="blog-card__body">
        <div className="blog-card__meta">
          <span className="blog-card__cat">{getCategoryLabel(post.category)}</span>
          <time className="blog-card__date" dateTime={post.publishedAt}>
            {formatDateKa(post.publishedAt)}
          </time>
        </div>
        {headingLevel === 'h3' ? (
          <h3 className="blog-card__title">{title}</h3>
        ) : (
          <h2 className="blog-card__title">{title}</h2>
        )}
        <p className="blog-card__excerpt">{post.excerpt}</p>
        <Link href={href} className="blog-card__read">
          {dict.blog.readMore}
        </Link>
      </div>
    </article>
  );
}
