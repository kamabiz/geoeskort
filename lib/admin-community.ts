import 'server-only';

import {
  COMMUNITY_CATEGORY_SLUGS,
  getCommunityPostViewPath,
  isStoryCategorySlug,
  MODULE_CATEGORIES,
  type ModuleCategorySlug,
} from '@/lib/community/categories';
import { prisma } from '@/lib/prisma';

const PAGE_SIZE = 50;

export function getCommunityPostPublicPath(category: string, slug: string): string {
  if (isStoryCategorySlug(category)) return getCommunityPostViewPath(category, slug);
  const mod = MODULE_CATEGORIES[category as ModuleCategorySlug];
  if (mod && category !== 'questions-advice') return mod.route;
  return getCommunityPostViewPath(category, slug);
}

export async function revalidateCommunityPost(post: { id: string; category: string; slug: string }): Promise<void> {
  const { revalidatePath } = await import('next/cache');
  revalidatePath('/', 'page');
  revalidatePath('/history/', 'page');
  revalidatePath('/questions/', 'page');
  revalidatePath(getCommunityPostViewPath(post.category, post.slug), 'page');
  revalidatePath(`/p/${post.slug}/`, 'page');
  revalidatePath(`/c/${post.category}/`, 'page');
}

export async function revalidateCommunityComment(postId: string, category?: string, slug?: string): Promise<void> {
  const { revalidatePath } = await import('next/cache');
  if (slug && category) {
    revalidatePath(getCommunityPostViewPath(category, slug), 'page');
  } else {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { category: true, slug: true },
    });
    if (post) revalidatePath(getCommunityPostViewPath(post.category, post.slug), 'page');
  }
  revalidatePath(`/p/${slug ?? postId}/`, 'page');
  if (category) revalidatePath(`/c/${category}/`, 'page');
  revalidatePath('/', 'page');
}

export async function revalidateCommunityMessages(): Promise<void> {
  const { revalidatePath } = await import('next/cache');
  revalidatePath('/conversationRoom/', 'page');
  revalidatePath('/gayChat/', 'page');
  revalidatePath('/messages/', 'page');
}

export type CommunityAuditTab = 'posts' | 'comments' | 'messages' | 'users';
export type CommunityAuditFilter = 'live' | 'archived' | 'all';

function postFilterWhere(filter: CommunityAuditFilter) {
  if (filter === 'live') return { status: 'PUBLISHED' as const };
  if (filter === 'archived') return { status: 'ARCHIVED' as const };
  return {};
}

function archivedAtFilterWhere(filter: CommunityAuditFilter) {
  if (filter === 'live') return { archivedAt: null };
  if (filter === 'archived') return { archivedAt: { not: null } };
  return {};
}

export async function getCommunityAuditStats() {
  const [posts, comments, messages, users, archivedPosts, archivedComments, archivedMessages] =
    await Promise.all([
      prisma.post.count(),
      prisma.comment.count(),
      prisma.message.count(),
      prisma.user.count(),
      prisma.post.count({ where: { status: 'ARCHIVED' } }),
      prisma.comment.count({ where: { archivedAt: { not: null } } }),
      prisma.message.count({ where: { archivedAt: { not: null } } }),
    ]);
  return { posts, comments, messages, users, archivedPosts, archivedComments, archivedMessages };
}

export async function getCommunityAuditPosts(options: {
  page?: number;
  q?: string;
  filter?: CommunityAuditFilter;
} = {}) {
  const page = Math.max(1, options.page ?? 1);
  const skip = (page - 1) * PAGE_SIZE;
  const q = options.q?.trim();
  const filter = options.filter ?? 'all';

  const where = {
    ...postFilterWhere(filter),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' as const } },
            { body: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        author: { select: { id: true, username: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: PAGE_SIZE,
      skip,
    }),
    prisma.post.count({ where }),
  ]);

  return { items, total, page, pageSize: PAGE_SIZE, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getCommunityAuditComments(options: {
  page?: number;
  q?: string;
  filter?: CommunityAuditFilter;
} = {}) {
  const page = Math.max(1, options.page ?? 1);
  const skip = (page - 1) * PAGE_SIZE;
  const q = options.q?.trim();
  const filter = options.filter ?? 'all';

  const where = {
    ...archivedAtFilterWhere(filter),
    ...(q ? { body: { contains: q, mode: 'insensitive' as const } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.comment.findMany({
      where,
      include: {
        author: { select: { id: true, username: true } },
        post: { select: { id: true, title: true, category: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: PAGE_SIZE,
      skip,
    }),
    prisma.comment.count({ where }),
  ]);

  return { items, total, page, pageSize: PAGE_SIZE, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getCommunityAuditMessages(options: {
  page?: number;
  q?: string;
  filter?: CommunityAuditFilter;
} = {}) {
  const page = Math.max(1, options.page ?? 1);
  const skip = (page - 1) * PAGE_SIZE;
  const q = options.q?.trim();
  const filter = options.filter ?? 'all';

  const where = {
    ...archivedAtFilterWhere(filter),
    ...(q ? { body: { contains: q, mode: 'insensitive' as const } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.message.findMany({
      where,
      include: {
        sender: { select: { id: true, username: true } },
        recipient: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: PAGE_SIZE,
      skip,
    }),
    prisma.message.count({ where }),
  ]);

  return { items, total, page, pageSize: PAGE_SIZE, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getCommunityAuditUsers(options: { page?: number; q?: string } = {}) {
  const page = Math.max(1, options.page ?? 1);
  const skip = (page - 1) * PAGE_SIZE;
  const q = options.q?.trim();

  const where = q
    ? {
        OR: [
          { username: { contains: q, mode: 'insensitive' as const } },
          { email: { contains: q, mode: 'insensitive' as const } },
        ],
      }
    : undefined;

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        email: true,
        points: true,
        isPremium: true,
        createdAt: true,
        lastActiveAt: true,
        _count: { select: { posts: true, comments: true, sentMessages: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: PAGE_SIZE,
      skip,
    }),
    prisma.user.count({ where }),
  ]);

  return { items, total, page, pageSize: PAGE_SIZE, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export { COMMUNITY_CATEGORY_SLUGS, PAGE_SIZE as COMMUNITY_AUDIT_PAGE_SIZE };
