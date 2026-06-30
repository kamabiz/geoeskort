import { SexologyArticleEditor } from '@/components/admin/SexologyArticleEditor';
import { AdminShell } from '@/components/admin/AdminShell';
import { requireAuth } from '@/lib/auth';

export default async function NewSexologyArticlePage() {
  await requireAuth();

  return (
    <AdminShell minimal backHref="/admin/sexology/" backLabel="← Back to sexology">
      <main className="admin-main admin-main--wide">
        <SexologyArticleEditor mode="create" />
      </main>
    </AdminShell>
  );
}
