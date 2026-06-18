import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { KamaLinks } from '@/components/KamaLinks';
import { BlogCard } from '@/components/BlogCard';
import { getAllPosts } from '@/lib/blog';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { localePath, absoluteUrl } from '@/lib/i18n/paths';
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
    path: '/',
    title: dict.meta.homeTitle,
    description: dict.meta.homeDescription,
    absolute: true,
  });
}

export default async function HomePage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const posts = (await getAllPosts()).slice(0, 3);

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: SITE_NAME,
          url: absoluteUrl(locale, '/'),
          description: dict.meta.homeDescription,
          inLanguage: locale,
        }}
      />

      <section className="hero">
        <div className="container hero__inner">
          <span className="hero__badge">{dict.hero.badge}</span>
          <h1 className="hero__title">
            {dict.hero.titleBefore}
            <em>{dict.hero.titleEm}</em>
            {dict.hero.titleAfter}
          </h1>
          <p className="hero__lead">{dict.hero.lead}</p>
          <div className="hero__actions">
            <a href="https://kama.biz" className="btn btn--primary" rel="noopener noreferrer">
              {dict.hero.ctaPrimary}
            </a>
            <Link href={localePath(locale, '/blog/')} className="btn btn--ghost">
              {dict.hero.ctaBlog}
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__head">
            <span className="section__label">{dict.links.label}</span>
            <h2 className="section__title">{dict.links.title}</h2>
            <p className="section__desc">{dict.links.desc}</p>
          </div>
          <KamaLinks dict={dict} />
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="section__head">
            <span className="section__label">{dict.blog.label}</span>
            <h2 className="section__title">{dict.blog.latestTitle}</h2>
            <p className="section__desc">{dict.blog.latestDesc}</p>
          </div>
          <div className="blog-grid">
            {posts.length === 0 ? (
              <p
                className="blog-card__excerpt"
                style={{ gridColumn: '1/-1', textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}
              >
                {dict.blog.empty}
              </p>
            ) : (
              posts.map((post) => (
                <BlogCard key={post.slug} post={post} locale={locale} dict={dict} headingLevel="h3" />
              ))
            )}
          </div>
          <p style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <Link href={localePath(locale, '/blog/')} className="btn btn--ghost">
              {dict.blog.allPosts}
            </Link>
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="promo-banner">
            <h2>{dict.promo.title}</h2>
            <p>{dict.promo.desc}</p>
            <a href="https://kama.biz/tbilisi" className="btn btn--primary" rel="noopener noreferrer">
              {dict.promo.btn}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
