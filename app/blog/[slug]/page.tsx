import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { formatDateKa, getAllPosts, getPostBySlug } from '@/lib/blog';
import { pageMetadata } from '@/lib/seo';
import { SITE_NAME, SITE_URL } from '@/lib/site';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: 'სტატია ვერ მოიძებნა' };

  return pageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}/`,
    ogType: 'article',
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const url = `${SITE_URL}/blog/${post.slug}/`;

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          mainEntityOfPage: { '@type': 'WebPage', '@id': url },
          headline: post.title,
          description: post.excerpt,
          datePublished: post.publishedAt,
          url,
          inLanguage: 'ka',
          publisher: {
            '@type': 'Organization',
            name: SITE_NAME,
            url: SITE_URL,
          },
        }}
      />

      <main className="container">
        <article className="post-wrap">
          <Link href="/blog/" className="post-back">
            ← ბლოგში დაბრუნება
          </Link>
          <header className="post-header">
            <div className="post-meta">
              <span className="post-cat">{post.category}</span>
              <time dateTime={post.publishedAt}>{formatDateKa(post.publishedAt)}</time>
            </div>
            <h1 className="post-title">{post.title}</h1>
            <p className="post-excerpt">{post.excerpt}</p>
          </header>
          <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />
          <div className="post-cta">
            <p>გადამოწმებული escort პროფილების სანახავად ეწვიეთ KAMA.BIZ-ს</p>
            <a href="https://kama.biz" className="btn btn--primary" rel="noopener noreferrer">
              KAMA.BIZ →
            </a>
          </div>
        </article>
      </main>
    </>
  );
}
