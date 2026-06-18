import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { KamaLinks } from '@/components/KamaLinks';
import { BlogCard } from '@/components/BlogCard';
import { getAllPosts } from '@/lib/blog';
import { pageMetadata } from '@/lib/seo';
import { SITE_NAME, SITE_URL } from '@/lib/site';

export const metadata = pageMetadata({
  title: `${SITE_NAME} • Nightlife & Escort გზამკვლევი საქართველოში +18`,
  description:
    'GEOESKORT – ღამის ცხოვრება, escort tbilisi, eskortebi საქართველოში. ინფორმაციული ბლოგი და სასარგებლო ლინკები KAMA.BIZ-ზე.',
  path: '/',
  absolute: true,
});

export default function HomePage() {
  const posts = getAllPosts().slice(0, 3);

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: SITE_NAME,
          url: `${SITE_URL}/`,
          description: 'Nightlife and escort guide for Georgia',
          inLanguage: 'ka',
        }}
      />

      <section className="hero">
        <div className="container hero__inner">
          <span className="hero__badge">+18 • Georgia Nightlife Guide</span>
          <h1 className="hero__title">
            Nightlife &amp; <em>Escort</em> კულტურა საქართველოში
          </h1>
          <p className="hero__lead">
            GEOESKORT არის ინფორმაციული პორტალი — ბლოგი ღამის ცხოვრების, escort tbilisi და eskortebi
            თემებზე. პროფილების კატალოგი ცალკეა: <strong>KAMA.BIZ</strong>.
          </p>
          <div className="hero__actions">
            <a href="https://kama.biz" className="btn btn--primary" rel="noopener noreferrer">
              ესკორტები საქართველოში →
            </a>
            <Link href="/blog/" className="btn btn--ghost">
              ბლოგის წაკითხვა
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__head">
            <span className="section__label">KAMA.BIZ</span>
            <h2 className="section__title">სასარგებლო ლინკები</h2>
            <p className="section__desc">
              ტოპ გვერდები escort tbilisi, batumi და საქართველოს სხვა ქალაქებში.
            </p>
          </div>
          <KamaLinks />
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="section__head">
            <span className="section__label">ბლოგი</span>
            <h2 className="section__title">ბოლო სტატიები</h2>
            <p className="section__desc">escort tbilisi, eskortebi, nightlife — გზამკვლევები და რჩევები.</p>
          </div>
          <div className="blog-grid">
            {posts.length === 0 ? (
              <p
                className="blog-card__excerpt"
                style={{ gridColumn: '1/-1', textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}
              >
                სტატიები მალე დაემატება.
              </p>
            ) : (
              posts.map((post) => <BlogCard key={post.slug} post={post} headingLevel="h3" />)
            )}
          </div>
          <p style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <Link href="/blog/" className="btn btn--ghost">
              ყველა სტატია →
            </Link>
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="promo-banner">
            <h2>პროფილების სანახავად → KAMA.BIZ</h2>
            <p>
              GEOESKORT არ არის პროფილების კატალოგი. Google-სთვის და თქვენთვის ცალკე: ჩვენ — ბლოგი, ისინი —
              escort პლატფორმა.
            </p>
            <a href="https://kama.biz/tbilisi" className="btn btn--primary" rel="noopener noreferrer">
              Escort Tbilisi → KAMA.BIZ
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
