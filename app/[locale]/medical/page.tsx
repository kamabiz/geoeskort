import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CommunityPostCard } from '@/components/community/CommunityPostCard';
import { getPublishedPosts, type PostWithAuthor } from '@/lib/community/posts';
import { safeCommunity } from '@/lib/community/safe';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { isLocale } from '@/lib/i18n/config';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';
import { pageMetadata } from '@/lib/seo';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; q?: string }>;
};

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const cd = getCommunityDict(raw as Locale);
  return pageMetadata({ locale: raw as Locale, path: '/medical/', title: cd.medical.title, description: cd.medical.lead });
}

export default async function MedicalPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  const { page: pageRaw, q } = await searchParams;
  if (!isLocale(raw)) notFound();

  const locale = raw as Locale;
  const cd = getCommunityDict(locale);
  const page = Math.max(1, parseInt(pageRaw || '1', 10) || 1);
  const limit = 12;
  const skip = (page - 1) * limit;

  const posts: PostWithAuthor[] = await safeCommunity(
    () => getPublishedPosts({ category: 'sexology', limit, skip, search: q }),
    [],
  );

  return (
    <main className="container community-page">
      <div className="page-header">
        <h1>{cd.medical.title}</h1>
        <p className="community-page__lead">{cd.medical.lead}</p>
      </div>

      <form className="history-filters" method="get">
        <input type="search" name="q" defaultValue={q} placeholder={cd.common.search} />
        <button type="submit" className="btn btn--ghost">{cd.common.search}</button>
      </form>

      <div className="community-grid">
        {posts.length === 0 ? (
          <p className="community-sidebar__empty">{cd.medical.noArticles}</p>
        ) : (
          posts.map((post) => <CommunityPostCard key={post.id} post={post} locale={locale} viewPath="history" />)
        )}
      </div>

      <div className="community-pagination">
        {page > 1 && <Link href={localePath(locale, `/medical/?page=${page - 1}`)} className="btn btn--ghost">{cd.common.previous}</Link>}
        {posts.length === limit && <Link href={localePath(locale, `/medical/?page=${page + 1}`)} className="btn btn--ghost">{cd.common.next}</Link>}
      </div>
    </main>
  );
}
