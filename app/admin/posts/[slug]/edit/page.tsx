import { PostEditor } from '@/components/admin/PostEditor';
import { requireAuth } from '@/lib/auth';
import { recordToAdminForm } from '@/lib/admin-blog';
import { getRecordBySlugAsync } from '@/lib/blog-store';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type Props = { params: Promise<{ slug: string }> };

export default async function EditPostPage({ params }: Props) {
  await requireAuth();
  const { slug } = await params;
  const record = await getRecordBySlugAsync(slug);
  if (!record) notFound();

  return (
    <div className="admin-shell">
      <header className="admin-header admin-header--minimal">
        <Link href="/admin/" className="admin-header__brand">
          ← Back to posts
        </Link>
      </header>
      <main className="admin-main admin-main--wide">
        <PostEditor mode="edit" initial={recordToAdminForm(record)} originalSlug={slug} />
      </main>
    </div>
  );
}
