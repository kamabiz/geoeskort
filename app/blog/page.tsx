import { JsonLd } from '@/components/JsonLd';
import { BlogCard } from '@/components/BlogCard';
import { BlogSidebar } from '@/components/BlogSidebar';
import { getAllPosts } from '@/lib/blog';
import { pageMetadata } from '@/lib/seo';
import { SITE_NAME, SITE_URL } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'ბლოგი – Nightlife & Escort საქართველო',
  description:
    'GEOESKORT ბლოგი — escort tbilisi, eskortebi, ღამის ცხოვრება თბილისში და ბათუმში. გზამკვლევები და რჩევები.',
  path: '/blog/',
});

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: `${SITE_NAME} ბლოგი`,
          description: 'Nightlife and escort guides for Georgia',
          url: `${SITE_URL}/blog/`,
          inLanguage: 'ka',
          publisher: {
            '@type': 'Organization',
            name: SITE_NAME,
            url: SITE_URL,
          },
        }}
      />

      <div className="page-header">
        <div className="container">
          <h1>ბლოგი</h1>
          <p>Nightlife, escort tbilisi, eskortebi — გზამკვლევები საქართველოში</p>
        </div>
      </div>

      <main className="container blog-layout">
        <div className="blog-content">
          <div className="blog-grid">
            {posts.length === 0 ? (
              <p
                className="blog-card__excerpt"
                style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem' }}
              >
                ჯერ არ არის გამოქვეყნებული სტატიები. მალე დაემატება.
              </p>
            ) : (
              posts.map((post) => <BlogCard key={post.slug} post={post} />)
            )}
          </div>
        </div>
        <BlogSidebar />
      </main>
    </>
  );
}
