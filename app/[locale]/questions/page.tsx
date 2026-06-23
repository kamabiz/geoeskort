import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CommunityPostCard } from '@/components/community/CommunityPostCard';
import { getCurrentUser } from '@/lib/community/auth';
import { getPublishedPosts, type PostWithAuthor } from '@/lib/community/posts';
import { safeCommunity } from '@/lib/community/safe';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { isLocale } from '@/lib/i18n/config';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';
import { pageMetadata } from '@/lib/seo';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
};

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const cd = getCommunityDict(raw as Locale);
  return pageMetadata({ locale: raw as Locale, path: '/questions/', title: cd.questions.title, description: cd.questions.lead });
}

export default async function QuestionsPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  const { page: pageRaw, sort } = await searchParams;
  if (!isLocale(raw)) notFound();

  const locale = raw as Locale;
  const cd = getCommunityDict(locale);
  const user = await getCurrentUser();
  const page = Math.max(1, parseInt(pageRaw || '1', 10) || 1);
  const limit = 12;
  const skip = (page - 1) * limit;
  const orderBy = sort === 'views' ? 'views' : 'latest';

  const posts: PostWithAuthor[] = await safeCommunity(
    () => getPublishedPosts({ category: 'questions-advice', limit, skip, orderBy }),
    [],
  );

  return (
    <main className="container community-page">
      <div className="page-header community-page__header">
        <div>
          <h1>{cd.questions.title}</h1>
          <p className="community-page__lead">{cd.questions.lead}</p>
        </div>
        {user ? (
          <Link href={localePath(locale, '/submit/?module=questions')} className="btn btn--primary">{cd.questions.addPost}</Link>
        ) : (
          <Link href={localePath(locale, '/login/')} className="btn btn--primary">{cd.questions.loginToPost}</Link>
        )}
      </div>

      <div className="history-categories">
        <Link href={localePath(locale, '/questions/?sort=latest')} className={`forum-chip${sort !== 'views' ? ' is-active' : ''}`}>{cd.questions.sortNew}</Link>
        <Link href={localePath(locale, '/questions/?sort=views')} className={`forum-chip${sort === 'views' ? ' is-active' : ''}`}>{cd.questions.sortActive}</Link>
      </div>

      <div className="community-grid">
        {posts.length === 0 ? (
          <p className="community-sidebar__empty">{cd.questions.noPosts}</p>
        ) : (
          posts.map((post) => <CommunityPostCard key={post.id} post={post} locale={locale} viewPath="questions" isLoggedIn={!!user} />)
        )}
      </div>

      <div className="community-pagination">
        {page > 1 && <Link href={localePath(locale, `/questions/?page=${page - 1}`)} className="btn btn--ghost">{cd.common.previous}</Link>}
        {posts.length === limit && <Link href={localePath(locale, `/questions/?page=${page + 1}`)} className="btn btn--ghost">{cd.common.next}</Link>}
      </div>
    </main>
  );
}
