import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CommunityPostCard } from '@/components/community/CommunityPostCard';
import { isCommunityCategorySlug, getCommunityCategoryLabel } from '@/lib/community/categories';
import { getPublishedPosts, type PostWithAuthor } from '@/lib/community/posts';
import { safeCommunity } from '@/lib/community/safe';
import { isLocale } from '@/lib/i18n/config';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';
import { pageMetadata } from '@/lib/seo';

type Props = {
  params: Promise<{ locale: string; category: string }>;
  searchParams: Promise<{ page?: string }>;
};

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props) {
  const { locale: raw, category } = await params;
  if (!isLocale(raw) || !isCommunityCategorySlug(category)) return {};
  return pageMetadata({
    locale: raw as Locale,
    path: `/c/${category}/`,
    title: getCommunityCategoryLabel(category),
    description: `Community stories in ${getCommunityCategoryLabel(category)}`,
  });
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { locale: raw, category } = await params;
  const { page: pageRaw } = await searchParams;
  if (!isLocale(raw) || !isCommunityCategorySlug(category)) notFound();

  const locale = raw as Locale;
  const page = Math.max(1, parseInt(pageRaw || '1', 10) || 1);
  const limit = 12;
  const skip = (page - 1) * limit;

  const posts: PostWithAuthor[] = await safeCommunity(
    () => getPublishedPosts({ category, limit, skip }),
    [],
  );

  return (
    <main className="container community-page">
      <div className="page-header community-page__header">
        <h1>{getCommunityCategoryLabel(category)}</h1>
        <Link href={localePath(locale, '/submit/')} className="btn btn--primary">Submit story</Link>
      </div>
      <div className="community-grid">
        {posts.length === 0 ? (
          <p className="community-sidebar__empty">No stories in this category yet.</p>
        ) : (
          posts.map((post) => <CommunityPostCard key={post.id} post={post} locale={locale} />)
        )}
      </div>
      <div className="community-pagination">
        {page > 1 && (
          <Link href={localePath(locale, `/c/${category}/?page=${page - 1}`)} className="btn btn--ghost">
            ← Previous
          </Link>
        )}
        {posts.length === limit && (
          <Link href={localePath(locale, `/c/${category}/?page=${page + 1}`)} className="btn btn--ghost">
            Next →
          </Link>
        )}
      </div>
    </main>
  );
}
