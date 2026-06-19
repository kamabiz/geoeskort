import { PostEditor } from '@/components/admin/PostEditor';
import { AdminShell } from '@/components/admin/AdminShell';
import { requireAuth } from '@/lib/auth';
import { recordToAdminForm } from '@/lib/admin-blog';
import { getRecordBySlugAsync } from '@/lib/blog-store';
import { notFound } from 'next/navigation';

type Props = { params: Promise<{ slug: string }> };

export default async function EditPostPage({ params }: Props) {
  await requireAuth();
  const { slug } = await params;
  const record = await getRecordBySlugAsync(slug);
  if (!record) notFound();

  return (
    <AdminShell minimal backHref="/admin/" backLabel="← Back to admin">
      <main className="admin-main admin-main--wide">
        <PostEditor mode="edit" initial={recordToAdminForm(record)} originalSlug={slug} />
      </main>
    </AdminShell>
  );
}
