import { notFound } from 'next/navigation';
import { SexologyArticleEditor } from '@/components/admin/SexologyArticleEditor';
import { AdminShell } from '@/components/admin/AdminShell';
import { getSexologyArticleById, recordToAdminForm } from '@/lib/admin-sexology';
import { requireAuth } from '@/lib/auth';
import { safeCommunity } from '@/lib/community/safe';

type Props = { params: Promise<{ id: string }> };

export default async function EditSexologyArticlePage({ params }: Props) {
  await requireAuth();
  const { id } = await params;

  const record = await safeCommunity(() => getSexologyArticleById(id), null);
  if (!record) notFound();

  return (
    <AdminShell minimal backHref="/admin/sexology/" backLabel="← Back to sexology">
      <main className="admin-main admin-main--wide">
        <SexologyArticleEditor
          mode="edit"
          initial={recordToAdminForm(record)}
          articleId={id}
          articleSlug={record.slug}
        />
      </main>
    </AdminShell>
  );
}
