import Link from 'next/link';
import { AdminShell } from '@/components/admin/AdminShell';
import { CommunityModerationActions } from '@/components/admin/CommunityModerationActions';
import {
  getCommunityAuditComments,
  getCommunityAuditMessages,
  getCommunityAuditPosts,
  getCommunityAuditStats,
  getCommunityAuditUsers,
  getCommunityPostPublicPath,
  type CommunityAuditFilter,
  type CommunityAuditTab,
} from '@/lib/admin-community';
import { getCommunityCategoryEmoji, getCommunityCategoryLabel } from '@/lib/community/categories';
import { displayAuthor } from '@/lib/community/posts';
import { makeExcerpt } from '@/lib/community/text';
import { requireAuth } from '@/lib/auth';

type Props = {
  searchParams: Promise<{ tab?: string; page?: string; q?: string; filter?: string }>;
};

function parseTab(value: string | undefined): CommunityAuditTab {
  if (value === 'comments' || value === 'messages' || value === 'users') return value;
  return 'posts';
}

function parseFilter(value: string | undefined): CommunityAuditFilter {
  if (value === 'live' || value === 'archived') return value;
  return 'all';
}

function auditHref(tab: CommunityAuditTab, page = 1, q?: string, filter?: CommunityAuditFilter) {
  const params = new URLSearchParams({ tab });
  if (page > 1) params.set('page', String(page));
  if (q) params.set('q', q);
  if (filter && filter !== 'all') params.set('filter', filter);
  return `/admin/community/?${params.toString()}`;
}

export default async function AdminCommunityPage({ searchParams }: Props) {
  await requireAuth();

  if (!process.env.DATABASE_URL) {
    return (
      <AdminShell section="community">
        <main className="admin-main">
          <h1>Community moderation</h1>
          <div className="admin-alert admin-alert--error">
            <strong>Database not configured.</strong> Set <code>DATABASE_URL</code> to audit community content.
          </div>
        </main>
      </AdminShell>
    );
  }

  const sp = await searchParams;
  const tab = parseTab(sp.tab);
  const filter = parseFilter(sp.filter);
  const page = Math.max(1, parseInt(sp.page || '1', 10) || 1);
  const q = sp.q?.trim() || undefined;
  const listFilter = tab === 'users' ? undefined : filter;

  const [stats, postsData, commentsData, messagesData, usersData] = await Promise.all([
    getCommunityAuditStats(),
    tab === 'posts' ? getCommunityAuditPosts({ page, q, filter: listFilter }) : null,
    tab === 'comments' ? getCommunityAuditComments({ page, q, filter: listFilter }) : null,
    tab === 'messages' ? getCommunityAuditMessages({ page, q, filter: listFilter }) : null,
    tab === 'users' ? getCommunityAuditUsers({ page, q }) : null,
  ]);

  const data =
    tab === 'comments'
      ? commentsData!
      : tab === 'messages'
        ? messagesData!
        : tab === 'users'
          ? usersData!
          : postsData!;

  const tabs: { id: CommunityAuditTab; label: string; count: number }[] = [
    { id: 'posts', label: 'Posts', count: stats.posts },
    { id: 'comments', label: 'Comments', count: stats.comments },
    { id: 'messages', label: 'Messages', count: stats.messages },
    { id: 'users', label: 'Users', count: stats.users },
  ];

  return (
    <AdminShell section="community">
      <main className="admin-main admin-main--wide">
        <div className="admin-dashboard__head">
          <h1>Community audit</h1>
          <p className="admin-muted">
            User stories, forum posts, comments, and chat messages — archive to hide, delete only when permanent removal is needed.
          </p>
        </div>

        <form className="admin-audit-search" method="get">
          <input type="hidden" name="tab" value={tab} />
          {listFilter && filter !== 'all' && <input type="hidden" name="filter" value={filter} />}
          <input
            type="search"
            name="q"
            defaultValue={q ?? ''}
            placeholder="Search…"
            className="admin-audit-search__input"
          />
          <button type="submit" className="admin-btn admin-btn--primary admin-btn--sm">
            Search
          </button>
          {q && (
            <Link href={auditHref(tab, 1, undefined, filter)} className="admin-btn admin-btn--ghost admin-btn--sm">
              Clear
            </Link>
          )}
        </form>

        {tab !== 'users' && (
          <nav className="admin-filter-pills" aria-label="Visibility filter">
            {(
              [
                ['all', 'All'],
                ['live', 'Live on site'],
                ['archived', 'Archived'],
              ] as const
            ).map(([value, label]) => (
              <Link
                key={value}
                href={auditHref(tab, 1, q, value)}
                className={`admin-filter-pills__pill${filter === value ? ' admin-filter-pills__pill--active' : ''}`}
              >
                {label}
              </Link>
            ))}
          </nav>
        )}

        <nav className="admin-tabs admin-tabs--page" aria-label="Community sections">
          {tabs.map((t) => (
            <Link
              key={t.id}
              href={auditHref(t.id, 1, q, t.id === 'users' ? undefined : filter)}
              className={`admin-tabs__tab${tab === t.id ? ' admin-tabs__tab--active' : ''}`}
            >
              {t.label} ({t.count})
            </Link>
          ))}
        </nav>

        <p className="admin-muted admin-audit-meta">
          Showing page {data.page} of {data.pages}
          {filter !== 'all' && tab !== 'users' ? ` · ${filter}` : ''}
          {q ? ` · search: “${q}”` : ''}
          {stats.archivedPosts + stats.archivedComments + stats.archivedMessages > 0 && (
            <> · {stats.archivedPosts} archived posts, {stats.archivedComments} comments, {stats.archivedMessages} messages</>
          )}
        </p>

        {tab === 'posts' && postsData && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title / excerpt</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {postsData.items.map((post) => (
                  <tr key={post.id}>
                    <td>
                      <div className="admin-audit-title">{post.title}</div>
                      <div className="admin-audit-excerpt">{makeExcerpt(post.body, 100)}</div>
                      <div className="admin-audit-sub">{post._count.comments} comments</div>
                    </td>
                    <td>{displayAuthor(post)}</td>
                    <td>
                      <span className="admin-table__emoji">{getCommunityCategoryEmoji(post.category)}</span>
                      {getCommunityCategoryLabel(post.category)}
                    </td>
                    <td>
                      <span className={`admin-badge admin-badge--${post.status === 'PUBLISHED' ? 'ok' : post.status === 'ARCHIVED' ? 'warn' : 'warn'}`}>
                        {post.status}
                      </span>
                    </td>
                    <td>{post.createdAt.toLocaleString('ka-GE')}</td>
                    <td>
                      <CommunityModerationActions
                        type="posts"
                        id={post.id}
                        archived={post.status === 'ARCHIVED'}
                        editHref={`/admin/community/posts/${post.id}/edit/`}
                        compact
                      />
                      {post.status === 'PUBLISHED' && (
                        <a
                          href={getCommunityPostPublicPath(post.category, post.id)}
                          className="admin-btn admin-btn--sm admin-btn--ghost"
                          target="_blank"
                          rel="noopener"
                        >
                          View
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'comments' && commentsData && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Comment</th>
                  <th>Author</th>
                  <th>On post</th>
                  <th>Date</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {commentsData.items.map((comment) => (
                  <tr key={comment.id}>
                    <td className="admin-audit-excerpt">{makeExcerpt(comment.body, 140)}</td>
                    <td>{comment.isAnonymous || !comment.author ? 'anon' : comment.author.username}</td>
                    <td>
                      <a
                        href={getCommunityPostPublicPath(comment.post.category, comment.post.id)}
                        target="_blank"
                        rel="noopener"
                      >
                        {comment.post.title}
                      </a>
                    </td>
                    <td>{comment.createdAt.toLocaleString('ka-GE')}</td>
                    <td>
                      <CommunityModerationActions
                        type="comments"
                        id={comment.id}
                        archived={comment.archivedAt != null}
                        editHref={`/admin/community/comments/${comment.id}/edit/`}
                        compact
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'messages' && messagesData && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Message</th>
                  <th>From</th>
                  <th>To / room</th>
                  <th>Date</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {messagesData.items.map((message) => (
                  <tr key={message.id}>
                    <td className="admin-audit-excerpt">{makeExcerpt(message.body, 140)}</td>
                    <td>{message.sender.username}</td>
                    <td>
                      {message.roomId
                        ? `room ${message.roomId}`
                        : message.recipient?.username ?? '—'}
                    </td>
                    <td>{message.createdAt.toLocaleString('ka-GE')}</td>
                    <td>
                      <CommunityModerationActions
                        type="messages"
                        id={message.id}
                        archived={message.archivedAt != null}
                        editHref={`/admin/community/messages/${message.id}/edit/`}
                        compact
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'users' && usersData && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Activity</th>
                  <th>Points</th>
                  <th>Joined</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {usersData.items.map((user) => (
                  <tr key={user.id}>
                    <td>
                      {user.username}
                      {user.isPremium && <span className="admin-badge admin-badge--ok"> premium</span>}
                    </td>
                    <td>{user.email ?? '—'}</td>
                    <td className="admin-audit-sub">
                      {user._count.posts} posts · {user._count.comments} comments · {user._count.sentMessages} msgs
                    </td>
                    <td>{user.points}</td>
                    <td>{user.createdAt.toLocaleString('ka-GE')}</td>
                    <td>
                      <a href={`/u/${user.username}/`} className="admin-btn admin-btn--sm admin-btn--ghost" target="_blank" rel="noopener">
                        Profile
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data.items.length === 0 && (
          <div className="admin-empty">
            <p>No {tab} found{q ? ' for this search' : ''}.</p>
          </div>
        )}

        {data.pages > 1 && (
          <nav className="admin-pagination">
            {data.page > 1 && (
              <Link href={auditHref(tab, data.page - 1, q, filter)} className="admin-btn admin-btn--sm">
                ← Previous
              </Link>
            )}
            <span className="admin-muted">
              Page {data.page} / {data.pages}
            </span>
            {data.page < data.pages && (
              <Link href={auditHref(tab, data.page + 1, q, filter)} className="admin-btn admin-btn--sm">
                Next →
              </Link>
            )}
          </nav>
        )}
      </main>
    </AdminShell>
  );
}
