import { PostEditor } from '@/components/admin/PostEditor';
import { requireAuth } from '@/lib/auth';
import Link from 'next/link';

export default async function NewPostPage() {
  await requireAuth();

  return (
    <div className="admin-shell">
      <header className="admin-header admin-header--minimal">
        <Link href="/admin/" className="admin-header__brand">
          ← Back to posts
        </Link>
      </header>
      <main className="admin-main admin-main--wide">
        <PostEditor mode="create" />
      </main>
    </div>
  );
}
