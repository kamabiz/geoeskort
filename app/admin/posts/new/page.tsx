import { PostEditor } from '@/components/admin/PostEditor';
import { AdminShell } from '@/components/admin/AdminShell';
import { requireAuth } from '@/lib/auth';

export default async function NewPostPage() {
  await requireAuth();

  return (
    <AdminShell minimal backHref="/admin/" backLabel="← Back to admin">
      <main className="admin-main admin-main--wide">
        <PostEditor mode="create" />
      </main>
    </AdminShell>
  );
}
