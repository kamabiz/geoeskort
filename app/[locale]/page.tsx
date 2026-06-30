import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { BlogCard } from '@/components/BlogCard';
import { HomeHeroStats } from '@/components/community/HomeHeroStats';
import { HomeForumSection } from '@/components/community/HomeForumSection';
import { HomeMobileHub } from '@/components/community/HomeMobileHub';
import { HomeTopStoriesRow } from '@/components/community/HomeTopStoriesRow';
import { getCurrentUser } from '@/lib/community/auth';
import { getAllPosts } from '@/lib/blog';
import {
  getCategoryCounts,
  getCommunityStats,
  getLatestComments,
  getPublishedPosts,
  getTopStoriesOfDay,
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

  const [user, topStories, latestPosts, randomPosts, categoryCounts, presence, latestComments, stats, topLeaders] =
    await Promise.all([
      getCurrentUser(),
      safeCommunity(() => getTopStoriesOfDay(STORY_CATEGORY_SLUGS, 2), [] as PostWithAuthor[]),
      safeCommunity(() => getPublishedPosts({ categories: STORY_CATEGORY_SLUGS, limit: 5 }), [] as PostWithAuthor[]),
      safeCommunity(() => getPublishedPosts({ categories: STORY_CATEGORY_SLUGS, limit: 4, orderBy: 'random' }), [] as PostWithAuthor[]),
      safeCommunity(() => getCategoryCounts(), []),
      safeCommunity(() => getPresenceStats(), { totalMembers: 0, onlineCount: 0, onlineMembers: [] }),
      safeCommunity(() => getLatestComments(5), []),
      safeCommunity(() => getCommunityStats(), { storyCount: 0, memberCount: 0, commentCount: 0, lastUser: null }),
      safeCommunity(() => getLeaderboard(5), []),
    ]);

  const topStory = topStories[0] ?? null;

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

          <HomeTopStoriesRow locale={locale} topStories={topStories} />
        </div>
        </section>

        <HomeForumSection
        locale={locale}
        latestPosts={latestPosts}
        randomPosts={randomPosts}
        categoryCounts={categoryCounts}
        presence={presence}
        latestComments={latestComments}
        topLeaders={topLeaders}
        />

        <div className="container">
          <a href="https://kama.biz" className="partner-banner" target="_blank">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/banner-kama.png" alt="Escorts in Georgia — kama.biz" width={728} height={90} loading="lazy" />
          </a>
        </div>

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

        <section className="home-stats-bar">
          <div className="container">
            <HomeHeroStats
              storyCount={stats.storyCount}
              onlineCount={presence.onlineCount}
              memberCount={stats.memberCount}
              commentCount={stats.commentCount}
              labels={{
                stories: cd.home.statsStories,
                online: cd.home.statsOnline,
                members: cd.home.statsMembers,
                comments: cd.home.statsComments,
              }}
            />
          </div>
        </section>
      </div>
    </>
  );
}
