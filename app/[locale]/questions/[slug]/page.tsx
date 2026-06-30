import { notFound } from 'next/navigation';
import { StoryDetail } from '@/components/community/StoryDetail';
import { getCurrentUser } from '@/lib/community/auth';
import { collectCommentIds, getPostCommentTree, getUpvotedCommentIds } from '@/lib/community/comments';
import { canViewPremiumContent } from '@/lib/community/premium';
import { getPostBySlug, incrementPostViews } from '@/lib/community/posts';
import { makeExcerpt } from '@/lib/community/text';
import { safeCommunity } from '@/lib/community/safe';
import { prisma } from '@/lib/prisma';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { isLocale } from '@/lib/i18n/config';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string; slug: string }> };

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) return {};
  const post = await safeCommunity(() => getPostBySlug(slug), null);
  const cd = getCommunityDict(raw as Locale);
  if (!post) return { title: cd.post.notFound };
  return pageMetadata({
    locale: raw as Locale,
    path: `/questions/${slug}/`,
    title: post.title,
    description: makeExcerpt(post.body, 160),
    ogType: 'article',
    publishedTime: post.createdAt.toISOString(),
  });
}

export default async function QuestionViewPage({ params }: Props) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  const post = await safeCommunity(async () => {
    const found = await getPostBySlug(slug);
    if (found) await incrementPostViews(found.id);
    return found;
  }, null);

  if (!post || post.status !== 'PUBLISHED') notFound();

  const user = await getCurrentUser();
  const canView = canViewPremiumContent(user, post.isPremium);

  const comments = await safeCommunity(() => getPostCommentTree(post.id), []);

  const [hasUpvoted, upvotedCommentIds] = await Promise.all([
    user
      ? safeCommunity(
          () =>
            prisma.postUpvote.findUnique({
              where: { userId_postId: { userId: user.id, postId: post.id } },
            }),
          null,
        )
      : Promise.resolve(null),
    user
      ? safeCommunity(
          () => getUpvotedCommentIds(user.id, collectCommentIds(comments)),
          new Set<string>(),
        )
      : Promise.resolve(new Set<string>()),
  ]);

  return (
    <StoryDetail
      locale={locale}
      post={post}
      comments={comments}
      canView={canView}
      backHref={localePath(locale, '/questions/')}
      isLoggedIn={!!user}
      currentUserId={user?.id ?? null}
      hasUpvoted={!!hasUpvoted}
      upvotedCommentIds={upvotedCommentIds}
    />
  );
}
