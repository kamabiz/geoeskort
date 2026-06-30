import Link from 'next/link';
import { AdminShell } from '@/components/admin/AdminShell';
import { getSexologyArticles } from '@/lib/admin-sexology';
import { requireAuth } from '@/lib/auth';
import { safeCommunity } from '@/lib/community/safe';

function statusLabel(status: string) {
  if (status === 'PUBLISHED') return 'Published';
  if (status === 'DRAFT') return 'Draft';
  if (status === 'ARCHIVED') return 'Archived';
  return status;
}

function statusClass(status: string) {
  if (status === 'PUBLISHED') return 'admin-badge admin-badge--ok';
  if (status === 'DRAFT') return 'admin-badge';
  return 'admin-badge admin-badge--warn';
}

export default async function SexologyAdminPage() {
  await requireAuth();

  const articles = await safeCommunity(() => getSexologyArticles(true), []);
  const publishedCount = articles.filter((a) => a.status === 'PUBLISHED').length;

  return (
    <AdminShell section="sexology">
      <main className="admin-main admin-main--wide">
        <div className="admin-editor__top" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ margin: 0, fontFamily: 'Georgia, serif' }}>სექსოლოგია</h1>
            <p className="admin-muted">Medical sexology articles for /medical/</p>
          </div>
          <Link href="/admin/sexology/new/" className="admin-btn admin-btn--primary">
            + New article
          </Link>
        </div>

        <div className="admin-alert admin-alert--info" style={{ marginBottom: '1.5rem' }}>
          Articles appear on{' '}
          <a href="/medical/" target="_blank" rel="noopener">
            /medical/
          </a>{' '}
          with HTML formatting, live preview, and content scoring — same editor experience as blog posts.
        </div>

        {articles.length === 0 ? (
          <div className="admin-empty">
            <p>No sexology articles yet — publish your first medical article.</p>
            <Link href="/admin/sexology/new/" className="admin-btn admin-btn--primary">
              Write first article
            </Link>
          </div>
        ) : (
          <>
            <p className="admin-muted" style={{ marginBottom: '1rem' }}>
              {publishedCount} published · {articles.length} total
            </p>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Tags</th>
                    <th>Views</th>
                    <th>Date</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article) => (
                    <tr key={article.id}>
                      <td>
                        <span className="admin-table__emoji">🩺</span>
                        {article.title}
                      </td>
                      <td>
                        <span className={statusClass(article.status)}>{statusLabel(article.status)}</span>
                      </td>
                      <td>
                        {article.tags.length > 0 ? (
                          <span className="admin-muted">{article.tags.slice(0, 3).join(', ')}</span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>{article.viewCount}</td>
                      <td>{article.createdAt.toLocaleDateString('ka-GE')}</td>
                      <td>
                        <Link href={`/admin/sexology/${article.id}/edit/`} className="admin-btn admin-btn--sm">
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </AdminShell>
  );
}
