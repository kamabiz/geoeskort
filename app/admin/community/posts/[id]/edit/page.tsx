import { CommunityPostEditor } from '@/components/admin/CommunityPostEditor';
import { AdminShell } from '@/components/admin/AdminShell';
import { getCommunityPostPublicPath } from '@/lib/admin-community';
import { displayAuthor } from '@/lib/community/posts';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

type Props = { params: Promise<{ id: string }> };

export default async function EditCommunityPostPage({ params }: Props) {
  await requireAuth();
  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id },
    include: { author: { select: { username: true } } },
  });
  if (!post) notFound();

  return (
    <AdminShell
      minimal
      backHref="/admin/community/?tab=posts"
      backLabel="← Community audit"
    >
      <main className="admin-main admin-main--wide">
        <CommunityPostEditor
          post={{
            id: post.id,
            title: post.title,
            body: post.body,
            category: post.category,
            tags: post.tags,
            status: post.status,
            isAnonymous: post.isAnonymous,
            isPremium: post.isPremium,
            authorLabel: displayAuthor(post),
            createdAt: post.createdAt.toISOString(),
            publicPath: getCommunityPostPublicPath(post.category, post.id),
          }}
        />
      </main>
    </AdminShell>
  );
}
