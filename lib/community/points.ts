import 'server-only';

import { PointAction } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const POINT_VALUES: Record<PointAction, number> = {
  POST_PUBLISHED: 50,
  POST_REPORTED: 10,
  PREMIUM_REDEEM: -500,
  COMMENT_RECEIVED: 2,
  POST_UPVOTED: 1,
  COMMENT_UPVOTED: 1,
};

export const PREMIUM_POINTS_COST = 500;
export const PREMIUM_DAYS = 30;

export { POINT_VALUES };

export async function awardPoints(
  userId: string,
  action: PointAction,
  referenceId?: string,
): Promise<void> {
  const points = POINT_VALUES[action];
  await prisma.$transaction([
    prisma.pointEvent.create({
      data: { userId, action, points, referenceId },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { points: { increment: points } },
    }),
  ]);
}

export async function getLeaderboard(limit = 20) {
  return prisma.user.findMany({
    orderBy: { points: 'desc' },
    take: limit,
    select: {
      id: true,
      username: true,
      avatar: true,
      points: true,
      isPremium: true,
      _count: { select: { posts: true } },
    },
  });
}
