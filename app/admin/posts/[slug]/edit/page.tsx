import { PostEditor } from '@/components/admin/PostEditor';
import { requireAuth } from '@/lib/auth';
import { getPostBySlugAsync } from '@/lib/blog-store';
import { inputFromPost } from '@/lib/blog-parse';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type Props = { params: Promise<{ slug: string }> };

export default async function EditPostPage({ params }: Props) {
  await requireAuth();
  const { slug } = await params;
  const post = await getPostBySlugAsync(slug);
  if (!post) notFound();

  return (
    <div className="admin-shell">
      <header className="admin-header admin-header--minimal">
        <Link href="/admin/" className="admin-header__brand">
          ← Back to posts
        </Link>
      </header>
      <main className="admin-main admin-main--wide">
        <PostEditor mode="edit" initial={inputFromPost(post)} originalSlug={slug} />
      </main>
    </div>
  );
}
