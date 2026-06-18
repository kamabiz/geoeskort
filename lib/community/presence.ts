import 'server-only';

import { prisma } from '@/lib/prisma';

const ONLINE_WINDOW_MS = 15 * 60 * 1000;

export async function touchUserActivity(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { lastActiveAt: new Date() },
  });
}

export async function getPresenceStats() {
  const since = new Date(Date.now() - ONLINE_WINDOW_MS);
  const [totalMembers, onlineMembers] = await Promise.all([
    prisma.user.count(),
    prisma.user.findMany({
      where: { lastActiveAt: { gte: since } },
      orderBy: { lastActiveAt: 'desc' },
      take: 20,
      select: {
        id: true,
        username: true,
        avatar: true,
        isPremium: true,
        lastActiveAt: true,
      },
    }),
  ]);

  return {
    totalMembers,
    onlineCount: onlineMembers.length,
    onlineMembers,
  };
}
