import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { formatDateKa } from '@/lib/format-date';
import { getAllPosts, getPostBySlug } from '@/lib/blog';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { absoluteUrl, localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';
import { pageMetadata } from '@/lib/seo';
import { SITE_NAME } from '@/lib/site';

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  const posts = getAllPosts();
  const locales = ['ka', 'en', 'ru', 'tr'] as Locale[];
  return locales.flatMap((locale) => posts.map((post) => ({ locale, slug: post.slug })));
}

export async function generateMetadata({ params }: Props) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const post = getPostBySlug(slug);
  const dict = getDictionary(locale);
  if (!post) return { title: dict.meta.postNotFound };
  return pageMetadata({
    locale,
    path: `/blog/${post.slug}/`,
    title: post.title,
    description: post.excerpt,
    ogType: 'article',
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const post = getPostBySlug(slug);
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
          datePublished: post.publishedAt,
          url,
          inLanguage: locale,
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
              <span className="post-cat">{post.category}</span>
              <time dateTime={post.publishedAt}>{formatDateKa(post.publishedAt)}</time>
            </div>
            <h1 className="post-title">{post.title}</h1>
            <p className="post-excerpt">{post.excerpt}</p>
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
