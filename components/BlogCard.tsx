import Link from 'next/link';
import type { BlogPost } from '@/lib/blog';
import { formatDateKa } from '@/lib/blog';

export function BlogCard({ post, headingLevel = 'h2' }: { post: BlogPost; headingLevel?: 'h2' | 'h3' }) {
  const Heading = headingLevel;
  return (
    <article className="blog-card">
      <Link href={`/blog/${post.slug}/`}>
        <div className="blog-card__thumb" aria-hidden="true">
          {post.emoji}
        </div>
      </Link>
      <div className="blog-card__body">
        <div className="blog-card__meta">
          <span className="blog-card__cat">{post.category}</span>
          <time className="blog-card__date" dateTime={post.publishedAt}>
            {formatDateKa(post.publishedAt)}
          </time>
        </div>
        <Heading className="blog-card__title">
          <Link href={`/blog/${post.slug}/`}>{post.title}</Link>
        </Heading>
        <p className="blog-card__excerpt">{post.excerpt}</p>
        <Link href={`/blog/${post.slug}/`} className="blog-card__read">
          წაიკითხე →
        </Link>
      </div>
    </article>
  );
}
