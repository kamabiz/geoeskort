import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { BlogCard } from '@/components/BlogCard';
import { HomeCategoriesPanel } from '@/components/community/HomeCategoriesPanel';
import { HomeForumSection } from '@/components/community/HomeForumSection';
import { HomeMobileHub } from '@/components/community/HomeMobileHub';
import { getCurrentUser } from '@/lib/community/auth';
import { getAllPosts } from '@/lib/blog';
import {
  getCategoryCounts,
  getCommunityStats,
  getLatestComments,
  getPublishedPosts,
  getTopStoryOfDay,
  type PostWithAuthor,
} from '@/lib/community/posts';
import { STORY_CATEGORY_SLUGS } from '@/lib/community/categories';
import { getPresenceStats } from '@/lib/community/presence';
import { getLeaderboard } from '@/lib/community/points';
import { safeCommunity } from '@/lib/community/safe';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { localePath, absoluteUrl } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';
import { pageMetadata } from '@/lib/seo';
import { SITE_NAME } from '@/lib/site';
import { notFound } from 'next/navigation';

type Props = { params: Promise<{ locale: string }> };

export const revalidate = 60;
export const dynamic = 'force-dynamic';

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
  const cd = getCommunityDict(locale);
  const posts = (await getAllPosts()).slice(0, 4);

  const [user, topStory, latestPosts, randomPosts, categoryCounts, presence, latestComments, stats, topLeaders] =
    await Promise.all([
      getCurrentUser(),
      safeCommunity(() => getTopStoryOfDay(STORY_CATEGORY_SLUGS), null),
      safeCommunity(() => getPublishedPosts({ categories: STORY_CATEGORY_SLUGS, limit: 5 }), [] as PostWithAuthor[]),
      safeCommunity(() => getPublishedPosts({ categories: STORY_CATEGORY_SLUGS, limit: 4, orderBy: 'random' }), [] as PostWithAuthor[]),
      safeCommunity(() => getCategoryCounts(), []),
      safeCommunity(() => getPresenceStats(), { totalMembers: 0, onlineCount: 0, onlineMembers: [] }),
      safeCommunity(() => getLatestComments(5), []),
      safeCommunity(() => getCommunityStats(), { storyCount: 0, memberCount: 0, commentCount: 0, lastUser: null }),
      safeCommunity(() => getLeaderboard(10), []),
    ]);

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

      <div className="home-surface">
        <section className="hero hero--home">
        <div className="container">
          <HomeMobileHub
            locale={locale}
            user={user}
            topStory={topStory}
            latestPost={latestPosts[0] ?? null}
            categoryCounts={categoryCounts}
            onlineCount={presence.onlineCount}
            storyCount={stats.storyCount}
            memberCount={stats.memberCount}
          />

          <div className="hero__shell hero__shell--desktop">
            <div className="hero__content">
              <div className="hero__greeting">
                <h1 className="hero__headline">
                  {cd.home.greetingHello},{' '}
                  {user ? (
                    <Link
                      href={localePath(locale, `/u/${user.username}/`)}
                      className="hero__headline-user"
                    >
                      @{user.username}
                    </Link>
                  ) : (
                    <span className="hero__headline-user hero__headline-user--guest">
                      @{cd.home.greetingGuest}
                    </span>
                  )}
                </h1>
                {!user && (
                  <p className="hero__headline-hint">
                    {cd.home.greetingAuthHint}{' '}
                    <Link href={localePath(locale, '/login/')}>{cd.home.greetingAuthLogin}</Link>
                    {' / '}
                    <Link href={localePath(locale, '/register/')}>{cd.home.greetingAuthRegister}</Link>
                  </p>
                )}
              </div>
            </div>

            <div className="hero__stats" role="list">
              <span className="hero__stat" role="listitem">
                <strong className="hero__stat-value">{stats.storyCount}</strong>
                <span className="hero__stat-label">{cd.home.statsStories}</span>
              </span>
              <span className="hero__stat hero__stat--live" role="listitem">
                <strong className="hero__stat-value">{presence.onlineCount}</strong>
                <span className="hero__stat-label">{cd.home.statsOnline}</span>
              </span>
              <span className="hero__stat" role="listitem">
                <strong className="hero__stat-value">{stats.memberCount}</strong>
                <span className="hero__stat-label">{cd.home.statsMembers}</span>
              </span>
              <span className="hero__stat" role="listitem">
                <strong className="hero__stat-value">{stats.commentCount}</strong>
                <span className="hero__stat-label">{cd.home.statsComments}</span>
              </span>
            </div>
          </div>

          <HomeCategoriesPanel
            locale={locale}
            categoryCounts={categoryCounts}
            className="home-hero-categories"
          />
        </div>
        </section>

        <HomeForumSection
        locale={locale}
        topStory={topStory}
        latestPosts={latestPosts}
        randomPosts={randomPosts}
        categoryCounts={categoryCounts}
        presence={presence}
        latestComments={latestComments}
        topLeaders={topLeaders}
        />

        <section className="section section--home">
        <div className="container">
          <div className="section__head">
            <span className="section__label">{dict.blog.label}</span>
            <h2 className="section__title">{dict.blog.latestTitleCaps}</h2>
          </div>
          <div className="blog-grid blog-grid--home">
            {posts.length === 0 ? (
              <p className="blog-grid__empty">{dict.blog.empty}</p>
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
      </div>
    </>
  );
}
