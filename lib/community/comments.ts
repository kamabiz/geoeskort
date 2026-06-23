import { prisma } from '@/lib/prisma';

const commentInclude = {
  author: { select: { username: true, avatar: true } },
  _count: { select: { upvotes: true } },
  replies: {
    where: { archivedAt: null },
    orderBy: { createdAt: 'asc' as const },
    include: {
      author: { select: { username: true, avatar: true } },
      _count: { select: { upvotes: true } },
    },
  },
};

export async function getPostCommentTree(postId: string) {
  return prisma.comment.findMany({
    where: { postId, parentId: null, archivedAt: null },
    orderBy: { createdAt: 'desc' },
    include: commentInclude,
  });
}

export function collectCommentIds(comments: { id: string; replies?: { id: string }[] }[]) {
  return comments.flatMap((comment) => [comment.id, ...(comment.replies?.map((reply) => reply.id) ?? [])]);
}

export async function getUpvotedCommentIds(userId: string, commentIds: string[]) {
  if (commentIds.length === 0) return new Set<string>();

  const rows = await prisma.commentUpvote.findMany({
    where: { userId, commentId: { in: commentIds } },
    select: { commentId: true },
  });

  return new Set(rows.map((row) => row.commentId));
}
