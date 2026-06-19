import { CommunityCommentEditor } from '@/components/admin/CommunityCommentEditor';
import { AdminShell } from '@/components/admin/AdminShell';
import { getCommunityPostPublicPath } from '@/lib/admin-community';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

type Props = { params: Promise<{ id: string }> };

export default async function EditCommunityCommentPage({ params }: Props) {
  await requireAuth();
  const { id } = await params;

  const comment = await prisma.comment.findUnique({
    where: { id },
    include: {
      author: { select: { username: true } },
      post: { select: { id: true, title: true, category: true } },
    },
  });
  if (!comment) notFound();

  return (
    <AdminShell
      minimal
      backHref="/admin/community/?tab=comments"
      backLabel="← Community audit"
    >
      <main className="admin-main admin-main--wide">
        <CommunityCommentEditor
          comment={{
            id: comment.id,
            body: comment.body,
            isAnonymous: comment.isAnonymous,
            authorLabel: comment.isAnonymous || !comment.author ? 'Anonymous' : comment.author.username,
            createdAt: comment.createdAt.toISOString(),
            post: {
              id: comment.post.id,
              title: comment.post.title,
              category: comment.post.category,
              publicPath: getCommunityPostPublicPath(comment.post.category, comment.post.id),
            },
          }}
        />
      </main>
    </AdminShell>
  );
}
