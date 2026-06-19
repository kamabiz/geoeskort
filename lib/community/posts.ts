import 'server-only';

import type { Post, User } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export type PostWithAuthor = Post & {
  author: Pick<User, 'id' | 'username' | 'avatar' | 'isPremium'> | null;
};

const postInclude = {
  author: {
    select: { id: true, username: true, avatar: true, isPremium: true },
  },
} as const;

export async function getPublishedPosts(options: {
  limit?: number;
  skip?: number;
  category?: string;
  categories?: string[];
  orderBy?: 'latest' | 'views' | 'random' | 'active';
  search?: string;
  tag?: string;
}) {
  const { limit = 12, skip = 0, category, categories, orderBy = 'latest', search, tag } = options;

  const where = {
    status: 'PUBLISHED' as const,
    ...(category ? { category } : {}),
    ...(categories?.length ? { category: { in: categories } } : {}),
    ...(tag ? { tags: { has: tag } } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { tags: { has: search.toLowerCase() } },
          ],
        }
      : {}),
  };

  if (orderBy === 'random') {
    const ids = await prisma.post.findMany({
      where,
      select: { id: true },
    });
    const shuffled = ids.sort(() => Math.random() - 0.5).slice(skip, skip + limit);
    if (shuffled.length === 0) return [];
    const posts = await prisma.post.findMany({
      where: { id: { in: shuffled.map((p) => p.id) } },
      include: postInclude,
    });
    const order = new Map(shuffled.map((p, i) => [p.id, i]));
    return posts.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  }

  return prisma.post.findMany({
    where,
    include: postInclude,
    orderBy:
      orderBy === 'views'
        ? [{ viewCount: 'desc' }, { createdAt: 'desc' }]
        : { createdAt: 'desc' },
    take: limit,
    skip,
  });
}

export async function getTopStoryOfDay(categories?: string[]): Promise<PostWithAuthor | null> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return prisma.post.findFirst({
    where: {
      status: 'PUBLISHED',
      createdAt: { gte: since },
      ...(categories?.length ? { category: { in: categories } } : {}),
    },
    include: postInclude,
    orderBy: [{ viewCount: 'desc' }, { createdAt: 'desc' }],
  });
}

export async function getCategoryCounts() {
  const rows = await prisma.post.groupBy({
    by: ['category'],
    where: { status: 'PUBLISHED' },
    _count: { _all: true },
  });
  return rows.map((row) => ({
    category: row.category,
    count: row._count._all,
  }));
}

export async function getPostById(id: string) {
  return prisma.post.findUnique({
    where: { id },
    include: postInclude,
  });
}

export async function incrementPostViews(id: string): Promise<void> {
  await prisma.post.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });
}

export async function getLatestComments(limit = 5) {
  return prisma.comment.findMany({
    where: { archivedAt: null },
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { id: true, username: true, avatar: true } },
      post: { select: { id: true, title: true, category: true } },
    },
  });
}

export async function getUserProfile(username: string) {
  return prisma.user.findUnique({
    where: { username },
    include: {
      _count: { select: { posts: true, comments: true } },
      posts: {
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: postInclude,
      },
    },
  });
}

export async function getCommunityStats() {
  const [storyCount, memberCount, commentCount, lastUser] = await Promise.all([
    prisma.post.count({ where: { status: 'PUBLISHED' } }),
    prisma.user.count(),
    prisma.comment.count({ where: { archivedAt: null } }),
    prisma.user.findFirst({ orderBy: { createdAt: 'desc' }, select: { username: true, createdAt: true } }),
  ]);
  return { storyCount, memberCount, commentCount, lastUser };
}

export function displayAuthor(
  post: { isAnonymous: boolean; author: { username: string } | null },
  anonymousLabel = 'ანონიმი',
): string {
  if (post.isAnonymous || !post.author) return anonymousLabel;
  return post.author.username;
}
