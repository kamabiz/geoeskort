import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CommunityPostCard } from '@/components/community/CommunityPostCard';
import { getCurrentUser } from '@/lib/community/auth';
import { GEORGIA_REGIONS } from '@/lib/community/regions';
import { getPublishedPosts, type PostWithAuthor } from '@/lib/community/posts';
import { safeCommunity } from '@/lib/community/safe';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { isLocale } from '@/lib/i18n/config';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';
import { pageMetadata } from '@/lib/seo';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; region?: string }>;
};

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const cd = getCommunityDict(raw as Locale);
  return pageMetadata({ locale: raw as Locale, path: '/crush/', title: cd.crush.title, description: cd.crush.lead });
}

export default async function CrushPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  const { page: pageRaw, region } = await searchParams;
  if (!isLocale(raw)) notFound();

  const locale = raw as Locale;
  const cd = getCommunityDict(locale);
  const user = await getCurrentUser();
  const page = Math.max(1, parseInt(pageRaw || '1', 10) || 1);
  const limit = 12;
  const skip = (page - 1) * limit;

  const posts: PostWithAuthor[] = await safeCommunity(
    () => getPublishedPosts({ category: 'dating-crush', limit, skip, tag: region }),
    [],
  );

  return (
    <main className="container community-page">
      <div className="page-header community-page__header">
        <div>
          <h1>{cd.crush.title}</h1>
          <p className="community-page__lead">{cd.crush.lead}</p>
          <p className="community-page__lead">{cd.crush.connectVia}</p>
        </div>
        {user ? (
          <Link href={localePath(locale, '/submit/?module=crush')} className="btn btn--primary">{cd.crush.addEntry}</Link>
        ) : (
          <Link href={localePath(locale, '/login/')} className="btn btn--primary">{cd.crush.loginToAdd}</Link>
        )}
      </div>

      <div className="history-categories">
        <Link href={localePath(locale, '/crush/')} className={`forum-chip${!region ? ' is-active' : ''}`}>{cd.crush.allRegions}</Link>
        {GEORGIA_REGIONS.map((r) => (
          <Link
            key={r.slug}
            href={localePath(locale, `/crush/?region=${r.slug}`)}
            className={`forum-chip${region === r.slug ? ' is-active' : ''}`}
          >
            {r.label}
          </Link>
        ))}
      </div>

      <div className="community-grid">
        {posts.length === 0 ? (
          <p className="community-sidebar__empty">{cd.crush.noEntries}</p>
        ) : (
          posts.map((post) => <CommunityPostCard key={post.id} post={post} locale={locale} viewPath="history" />)
        )}
      </div>

      <div className="community-pagination">
        {page > 1 && <Link href={localePath(locale, `/crush/?page=${page - 1}${region ? `&region=${region}` : ''}`)} className="btn btn--ghost">{cd.common.previous}</Link>}
        {posts.length === limit && <Link href={localePath(locale, `/crush/?page=${page + 1}${region ? `&region=${region}` : ''}`)} className="btn btn--ghost">{cd.common.next}</Link>}
      </div>
    </main>
  );
}
