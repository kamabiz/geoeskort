import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { getCategoryLabel } from '@/lib/blog-categories';
import { formatDateKa } from '@/lib/format-date';
import { getPostBySlug } from '@/lib/blog';
import { getAllRecordsAsync } from '@/lib/blog-store';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { absoluteUrl, localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';
import { pageMetadata } from '@/lib/seo';
import { SITE_NAME, SITE_URL } from '@/lib/site';

type Props = { params: Promise<{ locale: string; slug: string }> };

export const revalidate = 60;

export async function generateStaticParams() {
  const records = await getAllRecordsAsync();
  return records.map((record) => ({ locale: 'ka', slug: record.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const post = await getPostBySlug(slug);
  const dict = getDictionary(locale);
  if (!post) return { title: dict.meta.postNotFound };
  return pageMetadata({
    locale,
    path: `/blog/${post.slug}/`,
    title: post.seoTitle || post.title,
    description: post.excerpt,
    ogType: 'article',
    publishedTime: `${post.publishedAt}T00:00:00.000Z`,
    tags: post.tags,
    keywords: post.tags.join(', '),
  });
}

function wordCount(html: string): number {
  return html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
}

export default async function BlogPostPage({ params }: Props) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const url = absoluteUrl(locale, `/blog/${post.slug}/`);

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          mainEntityOfPage: { '@type': 'WebPage', '@id': url },
          headline: post.title,
          description: post.excerpt,
          datePublished: `${post.publishedAt}T00:00:00.000Z`,
          dateModified: `${post.publishedAt}T00:00:00.000Z`,
          url,
          inLanguage: 'ka',
          keywords: post.tags.join(', '),
          wordCount: wordCount(post.content),
          articleSection: getCategoryLabel(post.category),
          author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
          publisher: { '@type': 'Organization', name: SITE_NAME, url: absoluteUrl('ka', '/') },
        }}
      />

      <main className="container">
        <article className="post-wrap">
          <Link href={localePath(locale, '/blog/')} className="post-back">
            {dict.blog.back}
          </Link>
          <header className="post-header">
            <div className="post-meta">
              <span className="post-cat">{getCategoryLabel(post.category)}</span>
              <time dateTime={post.publishedAt}>{formatDateKa(post.publishedAt)}</time>
            </div>
            <h1 className="post-title">{post.title}</h1>
            <p className="post-excerpt">{post.excerpt}</p>
            {post.tags.length > 0 && (
              <div className="post-tags">
                {post.tags.map((tag) => (
                  <span key={tag} className="post-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>
          <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />
          <div className="post-cta">
            <p>{dict.blog.cta}</p>
            <a href="https://kama.biz" className="btn btn--primary" rel="noopener noreferrer">
              {dict.blog.ctaBtn}
            </a>
          </div>
        </article>
      </main>
    </>
  );
}
