import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CommentThread } from '@/components/community/CommentThread';
import { PremiumLockedBody } from '@/components/community/PremiumLockedBody';
import { getCurrentUser } from '@/lib/community/auth';
import { getCommunityCategoryLabel } from '@/lib/community/categories';
import { canViewPremiumContent } from '@/lib/community/premium';
import { displayAuthor, getPostById, incrementPostViews } from '@/lib/community/posts';
import { safeCommunity } from '@/lib/community/safe';
import { markdownToHtml } from '@/lib/community/text';
import { prisma } from '@/lib/prisma';
import { formatDateKa } from '@/lib/format-date';
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
  if (!post) return { title: 'Story not found' };
  return pageMetadata({
    locale: raw as Locale,
    path: `/p/${id}/`,
    title: post.title,
    description: post.title,
  });
}

export default async function CommunityPostPage({ params }: Props) {
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

  const comments = await safeCommunity(
    () =>
      prisma.comment.findMany({
        where: { postId: id, parentId: null },
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { username: true } },
          replies: {
            orderBy: { createdAt: 'asc' },
            include: { author: { select: { username: true } } },
          },
        },
      }),
    [],
  );

  return (
    <main className="container community-page">
      <article className="post-wrap">
        <Link href={localePath(locale, `/c/${post.category}/`)} className="post-back">
          ← {getCommunityCategoryLabel(post.category)}
        </Link>
        <header className="post-header">
          <div className="post-meta">
            <span className="post-cat">{getCommunityCategoryLabel(post.category)}</span>
            <time dateTime={post.createdAt.toISOString()}>{formatDateKa(post.createdAt.toISOString())}</time>
            <span>{post.viewCount} views</span>
            <span>{post.readingTimeMinutes} min read</span>
          </div>
          <h1 className="post-title">{post.title}</h1>
          <p className="post-excerpt">By {displayAuthor(post)}</p>
          {post.tags.length > 0 && (
            <div className="post-tags">
              {post.tags.map((tag) => (
                <span key={tag} className="post-tag">{tag}</span>
              ))}
            </div>
          )}
        </header>
        {canView ? (
          <div className="post-content" dangerouslySetInnerHTML={{ __html: markdownToHtml(post.body) }} />
        ) : (
          <PremiumLockedBody locale={locale} />
        )}
      </article>
      <CommentThread locale={locale} postId={post.id} comments={comments} />
    </main>
  );
}
