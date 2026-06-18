import { JsonLd } from '@/components/JsonLd';
import { BlogCard } from '@/components/BlogCard';
import { BlogSidebar } from '@/components/BlogSidebar';
import { isBlogCategorySlug, BLOG_CATEGORY_SLUGS } from '@/lib/blog-categories';
import { getAllPosts } from '@/lib/blog';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { absoluteUrl } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';
import { pageMetadata } from '@/lib/seo';
import { SITE_NAME } from '@/lib/site';
import { notFound } from 'next/navigation';

type Props = { params: Promise<{ locale: string; category: string }> };

export const revalidate = 60;

export async function generateStaticParams() {
  return BLOG_CATEGORY_SLUGS.map((category) => ({ locale: 'ka', category }));
}

export async function generateMetadata({ params }: Props) {
  const { locale: raw, category: rawCategory } = await params;
  if (!isLocale(raw) || !isBlogCategorySlug(rawCategory)) return {};
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const cat = dict.blog.categories[rawCategory];
  return pageMetadata({
    locale,
    path: `/blog/category/${rawCategory}/`,
    title: `${cat.label} – ${dict.blog.pageTitle}`,
    description: cat.desc,
  });
}

export default async function BlogCategoryPage({ params }: Props) {
  const { locale: raw, category: rawCategory } = await params;
  if (!isLocale(raw) || !isBlogCategorySlug(rawCategory)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const cat = dict.blog.categories[rawCategory];
  const posts = (await getAllPosts()).filter((post) => post.category === rawCategory);

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `${cat.label} – ${SITE_NAME}`,
          description: cat.desc,
          url: absoluteUrl(locale, `/blog/category/${rawCategory}/`),
          inLanguage: locale,
        }}
      />

      <div className="page-header">
        <div className="container">
          <h1>{cat.label}</h1>
          <p>{cat.desc}</p>
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
        <BlogSidebar locale={locale} dict={dict} activeCategory={rawCategory} />
      </main>
    </>
  );
}
