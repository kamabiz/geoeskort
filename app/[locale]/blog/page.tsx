import { JsonLd } from '@/components/JsonLd';
import { BlogCard } from '@/components/BlogCard';
import { BlogSidebar } from '@/components/BlogSidebar';
import { getAllPosts } from '@/lib/blog';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { absoluteUrl } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';
import { pageMetadata } from '@/lib/seo';
import { SITE_NAME } from '@/lib/site';
import { notFound } from 'next/navigation';

type Props = { params: Promise<{ locale: string }> };

export const revalidate = 60;

export async function generateMetadata({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  return pageMetadata({
    locale,
    path: '/blog/',
    title: dict.meta.blogTitle,
    description: dict.meta.blogDescription,
  });
}

export default async function BlogPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const posts = await getAllPosts(locale);

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: `${SITE_NAME} ${dict.blog.pageTitle}`,
          description: dict.meta.blogDescription,
          url: absoluteUrl(locale, '/blog/'),
          inLanguage: locale,
          publisher: { '@type': 'Organization', name: SITE_NAME, url: absoluteUrl('ka', '/') },
        }}
      />

      <div className="page-header">
        <div className="container">
          <h1>{dict.blog.pageTitle}</h1>
          <p>{dict.blog.pageDesc}</p>
        </div>
      </div>

      <main className="container blog-layout">
        <div className="blog-content">
          <div className="blog-grid">
            {posts.length === 0 ? (
              <p className="blog-card__excerpt" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem' }}>
                {dict.blog.emptyList}
              </p>
            ) : (
              posts.map((post) => <BlogCard key={post.slug} post={post} locale={locale} dict={dict} />)
            )}
          </div>
        </div>
        <BlogSidebar />
      </main>
    </>
  );
}
