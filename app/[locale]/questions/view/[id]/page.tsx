import { notFound } from 'next/navigation';
import { StoryDetail } from '@/components/community/StoryDetail';
import { getCurrentUser } from '@/lib/community/auth';
import { canViewPremiumContent } from '@/lib/community/premium';
import { getPostById, incrementPostViews } from '@/lib/community/posts';
import { safeCommunity } from '@/lib/community/safe';
import { prisma } from '@/lib/prisma';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { isLocale } from '@/lib/i18n/config';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string; id: string }> };

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props) {
  const { locale: raw, id } = await params;
  if (!isLocale(raw)) return {};
  const post = await safeCommunity(() => getPostById(id), null);
  const cd = getCommunityDict(raw as Locale);
  if (!post) return { title: cd.post.notFound };
  return pageMetadata({ locale: raw as Locale, path: `/questions/view/${id}/`, title: post.title, description: post.title });
}

export default async function QuestionViewPage({ params }: Props) {
  const { locale: raw, id } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  const post = await safeCommunity(async () => {
    await incrementPostViews(id);
    return getPostById(id);
  }, null);

  if (!post || post.status !== 'PUBLISHED') notFound();

  const user = await getCurrentUser();
  const canView = canViewPremiumContent(user, post.isPremium);

  const [comments, hasUpvoted] = await Promise.all([
    safeCommunity(
      () =>
        prisma.comment.findMany({
          where: { postId: id, parentId: null, archivedAt: null },
          orderBy: { createdAt: 'desc' },
          include: {
            author: { select: { username: true, avatar: true } },
            replies: {
              where: { archivedAt: null },
              orderBy: { createdAt: 'asc' },
              include: { author: { select: { username: true, avatar: true } } },
            },
          },
        }),
      [],
    ),
    user
      ? safeCommunity(
          () =>
            prisma.postUpvote.findUnique({
              where: { userId_postId: { userId: user.id, postId: id } },
            }),
          null,
        )
      : Promise.resolve(null),
  ]);

  return (
    <StoryDetail
      locale={locale}
      post={post}
      comments={comments}
      canView={canView}
      backHref={localePath(locale, '/questions/')}
      isLoggedIn={!!user}
      hasUpvoted={!!hasUpvoted}
    />
  );
}
