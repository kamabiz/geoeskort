import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CommunityPostCard } from '@/components/community/CommunityPostCard';
import {
  STORY_CATEGORIES,
  STORY_CATEGORY_SLUGS,
  MODULE_CATEGORIES,
  MODULE_CATEGORY_SLUGS,
  isStoryCategorySlug,
  isModuleCategorySlug,
} from '@/lib/community/categories';
import { getPublishedPosts, type PostWithAuthor } from '@/lib/community/posts';
import { safeCommunity } from '@/lib/community/safe';
import { getCurrentUser } from '@/lib/community/auth';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { isLocale } from '@/lib/i18n/config';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';
import { pageMetadata } from '@/lib/seo';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; page?: string; q?: string; tag?: string }>;
};

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const cd = getCommunityDict(raw as Locale);
  return pageMetadata({
    locale: raw as Locale,
    path: '/history/',
    title: cd.history.title,
    description: cd.history.lead,
  });
}

export default async function HistoryPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  const { category, page: pageRaw, q, tag } = await searchParams;
  if (!isLocale(raw)) notFound();

  const locale = raw as Locale;
  const cd = getCommunityDict(locale);
  const user = await getCurrentUser();
  const page = Math.max(1, parseInt(pageRaw || '1', 10) || 1);
  const limit = 12;
  const skip = (page - 1) * limit;
  const activeCategory = category && (isStoryCategorySlug(category) || isModuleCategorySlug(category))
    ? category
    : undefined;

  const [posts, popular] = await Promise.all([
    safeCommunity(
      () =>
        getPublishedPosts({
          category: activeCategory,
          limit,
          skip,
          search: q,
          tag,
        }),
      [] as PostWithAuthor[],
    ),
    safeCommunity(
      () => getPublishedPosts({ categories: STORY_CATEGORY_SLUGS, limit: 5, orderBy: 'views' }),
      [] as PostWithAuthor[],
    ),
  ]);

  return (
    <main className="container community-page">
      <div className="page-header community-page__header">
        <div>
          <h1>{cd.history.title}</h1>
          <p className="community-page__lead">{cd.history.lead}</p>
        </div>
        <Link href={localePath(locale, '/submit/')} className="btn btn--primary">{cd.history.addStory}</Link>
      </div>

      <p className="history-disclaimer">{cd.history.disclaimer}</p>

      <form className="history-filters" method="get">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder={cd.history.searchPlaceholder}
          aria-label={cd.history.search}
        />
        {activeCategory && <input type="hidden" name="category" value={activeCategory} />}
        {tag && <input type="hidden" name="tag" value={tag} />}
        <button type="submit" className="btn btn--ghost">{cd.history.search}</button>
      </form>

      <div className="history-categories">
        <Link
          href={localePath(locale, '/history/')}
          className={`forum-chip${!activeCategory ? ' is-active' : ''}`}
        >
          ყველა
        </Link>
        {STORY_CATEGORY_SLUGS.map((slug) => (
          <Link
            key={slug}
            href={localePath(locale, `/history/?category=${slug}`)}
            className={`forum-chip${activeCategory === slug ? ' is-active' : ''}`}
          >
            <span className="forum-chip__emoji">{STORY_CATEGORIES[slug].emoji}</span>
            {STORY_CATEGORIES[slug].label}
            {STORY_CATEGORIES[slug].isPremiumOnly && (
              <span className="community-card__premium">Premium</span>
            )}
          </Link>
        ))}
        {MODULE_CATEGORY_SLUGS.map((slug) => (
          <Link
            key={slug}
            href={localePath(locale, `/history/?category=${slug}`)}
            className={`forum-chip${activeCategory === slug ? ' is-active' : ''}`}
          >
            <span className="forum-chip__emoji">{MODULE_CATEGORIES[slug].emoji}</span>
            {MODULE_CATEGORIES[slug].label}
          </Link>
        ))}
      </div>

      {!user && <p className="history-tags-note">{cd.history.tagsAuthOnly}</p>}

      {popular.length > 0 && !q && page === 1 && (
        <section className="forum-block">
          <h2 className="forum-block__head">{cd.history.popular}</h2>
          <div className="forum-grid">
            {popular.map((post) => (
              <CommunityPostCard key={post.id} post={post} locale={locale} viewPath="history" isLoggedIn={!!user} />
            ))}
          </div>
        </section>
      )}

      <div className="community-grid">
        {posts.length === 0 ? (
          <p className="community-sidebar__empty">{cd.history.noStories}</p>
        ) : (
          posts.map((post) => (
            <CommunityPostCard key={post.id} post={post} locale={locale} viewPath="history" isLoggedIn={!!user} />
          ))
        )}
      </div>

      <div className="community-pagination">
        {page > 1 && (
          <Link
            href={localePath(locale, `/history/?page=${page - 1}${activeCategory ? `&category=${activeCategory}` : ''}${q ? `&q=${q}` : ''}`)}
            className="btn btn--ghost"
          >
            {cd.common.previous}
          </Link>
        )}
        {posts.length === limit && (
          <Link
            href={localePath(locale, `/history/?page=${page + 1}${activeCategory ? `&category=${activeCategory}` : ''}${q ? `&q=${q}` : ''}`)}
            className="btn btn--ghost"
          >
            {cd.common.next}
          </Link>
        )}
      </div>
    </main>
  );
}
