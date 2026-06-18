import Link from 'next/link';
import { getCategoryLabel, getCategoryEmoji } from '@/lib/blog-categories';
import { requireAuth, clearSessionCookie } from '@/lib/auth';
import { recordPrimaryTitle } from '@/lib/admin-blog';
import { getAllRecordsAsync, getStorageMode } from '@/lib/blog-store';
import { redirect } from 'next/navigation';

async function logoutAction() {
  'use server';
  await clearSessionCookie();
  redirect('/admin/login/');
}

export default async function AdminDashboardPage() {
  await requireAuth();
  const records = await getAllRecordsAsync(true);
  const storage = getStorageMode();

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div className="admin-header__brand">
          <Link href="/admin/">GEO<span>ESKORT</span> Admin</Link>
        </div>
        <nav className="admin-header__nav">
          <Link href="/" className="admin-btn admin-btn--ghost" target="_blank">
            View site ↗
          </Link>
          <Link href="/admin/posts/new/" className="admin-btn admin-btn--primary">
            + New post
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="admin-btn admin-btn--ghost">
              Log out
            </button>
          </form>
        </nav>
      </header>

      <main className="admin-main">
        {storage === 'unconfigured' && (
          <div className="admin-alert admin-alert--error">
            <strong>Production storage not configured.</strong> Vercel cannot write files to disk.
            Go to Vercel Dashboard → Storage → Blob → Create → Connect to project, then redeploy.
          </div>
        )}
        {storage === 'filesystem' && (
          <div className="admin-alert admin-alert--info">
            Storage: local files. On Vercel, add <code>BLOB_READ_WRITE_TOKEN</code> env var for persistent posts.
          </div>
        )}

        <div className="admin-dashboard__head">
          <h1>Blog posts</h1>
          <p className="admin-muted">{records.length} posts</p>
        </div>

        <div className="admin-alert admin-alert--info" style={{ marginBottom: '1.5rem' }}>
          <strong>Premium (archived):</strong> disabled — app is fully free.{' '}
          <Link href="/admin/premium/">View reference &amp; reactivation guide →</Link>
        </div>

        {records.length === 0 ? (
          <div className="admin-empty">
            <p>No posts yet — create your first SEO-optimized article.</p>
            <Link href="/admin/posts/new/" className="admin-btn admin-btn--primary">
              Write first post
            </Link>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Slug</th>
                  <th>Date</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.slug}>
                    <td>
                      <span className="admin-table__emoji">{getCategoryEmoji(record.category)}</span>
                      {recordPrimaryTitle(record)}
                    </td>
                    <td>{getCategoryLabel(record.category)}</td>
                    <td><code>{record.slug}</code></td>
                    <td>{record.publishedAt}</td>
                    <td>
                      <Link href={`/admin/posts/${record.slug}/edit/`} className="admin-btn admin-btn--sm">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
