import Link from 'next/link';
import { AdminShell } from '@/components/admin/AdminShell';
import { getCategoryLabel, getCategoryEmoji } from '@/lib/blog-categories';
import { recordPrimaryTitle } from '@/lib/admin-blog';
import { getCommunityAuditStats } from '@/lib/admin-community';
import { requireAuth } from '@/lib/auth';
import { getAllRecordsAsync, getStorageMode } from '@/lib/blog-store';
import { safeCommunity } from '@/lib/community/safe';

export default async function AdminDashboardPage() {
  await requireAuth();
  const records = await getAllRecordsAsync(true);
  const storage = getStorageMode();
  const communityStats = await safeCommunity(
    () => getCommunityAuditStats(),
    { posts: 0, comments: 0, messages: 0, users: 0, archivedPosts: 0, archivedComments: 0, archivedMessages: 0 },
  );

  return (
    <AdminShell section="blog">
      <main className="admin-main admin-main--wide">
        <div className="admin-dashboard__head">
          <h1>Admin</h1>
          <p className="admin-muted">Blog CMS and community moderation</p>
        </div>

        <div className="admin-hub">
          <Link href="/admin/community/" className="admin-hub__card admin-hub__card--primary">
            <span className="admin-hub__label">Stories &amp; chat moderation</span>
            <strong className="admin-hub__title">Community audit</strong>
            <p className="admin-muted">
              {communityStats.posts} posts · {communityStats.comments} comments · {communityStats.messages} messages
            </p>
            <span className="admin-hub__cta">Review &amp; edit →</span>
          </Link>
          <div className="admin-hub__card">
            <span className="admin-hub__label">SEO articles</span>
            <strong className="admin-hub__title">Blog posts</strong>
            <p className="admin-muted">{records.length} published articles</p>
            <Link href="/admin/posts/new/" className="admin-hub__cta admin-hub__cta--inline">
              + New blog post
            </Link>
          </div>
        </div>

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

        <div className="admin-alert admin-alert--info" style={{ marginBottom: '1.5rem' }}>
          <strong>Premium (archived):</strong> disabled — app is fully free.{' '}
          <Link href="/admin/premium/">View reference &amp; reactivation guide →</Link>
        </div>

        <div className="admin-dashboard__head">
          <h2>Blog posts</h2>
          <p className="admin-muted">{records.length} posts</p>
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
    </AdminShell>
  );
}
