'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCommunityModerationMutations } from '@/components/admin/CommunityModerationActions';
import { COMMUNITY_CATEGORY_SLUGS, getCommunityCategoryLabel } from '@/lib/community/categories';

type PostData = {
  id: string;
  title: string;
  body: string;
  category: string;
  tags: string[];
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isAnonymous: boolean;
  isPremium: boolean;
  authorLabel: string;
  createdAt: string;
  publicPath: string;
};

export function CommunityPostEditor({ post }: { post: PostData }) {
  const router = useRouter();
  const { archive, restore, remove, busy, error, setError } = useCommunityModerationMutations('posts', post.id);
  const [form, setForm] = useState({
    title: post.title,
    body: post.body,
    category: post.category,
    tags: post.tags.join(', '),
    status: post.status,
    isAnonymous: post.isAnonymous,
    isPremium: post.isPremium,
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const isArchived = post.status === 'ARCHIVED';

  async function save() {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/admin/community/posts/${post.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          body: form.body.trim(),
          category: form.category,
          tags: form.tags
            .split(',')
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean),
          status: form.status,
          isAnonymous: form.isAnonymous,
          isPremium: form.isPremium,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setSuccess('Saved.');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-editor">
      <div className="admin-editor__top">
        <div>
          <h1>Edit community post</h1>
          <p className="admin-muted">
            {post.authorLabel} · {new Date(post.createdAt).toLocaleString('ka-GE')}
          </p>
          {isArchived && (
            <p className="admin-badge admin-badge--warn" style={{ display: 'inline-block', marginTop: '0.5rem' }}>
              Archived — hidden from site
            </p>
          )}
        </div>
        <div className="admin-editor__actions">
          {!isArchived && (
            <a href={post.publicPath} className="admin-btn admin-btn--ghost" target="_blank" rel="noopener">
              View on site ↗
            </a>
          )}
          {isArchived ? (
            <button type="button" className="admin-btn admin-btn--ghost" onClick={restore} disabled={busy || saving}>
              Restore
            </button>
          ) : (
            <button type="button" className="admin-btn admin-btn--ghost" onClick={archive} disabled={busy || saving}>
              Archive
            </button>
          )}
          <button type="button" className="admin-btn admin-btn--danger" onClick={remove} disabled={busy || saving}>
            Delete
          </button>
          <button type="button" className="admin-btn admin-btn--primary" onClick={save} disabled={busy || saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}
      {success && <div className="admin-alert admin-alert--success">{success}</div>}

      <div className="admin-card">
        <label className="admin-field">
          <span>Title</span>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
        </label>

        <label className="admin-field">
          <span>Body</span>
          <textarea
            rows={16}
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          />
        </label>

        <div className="admin-field-row">
          <label className="admin-field">
            <span>Category</span>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            >
              {COMMUNITY_CATEGORY_SLUGS.map((slug) => (
                <option key={slug} value={slug}>
                  {getCommunityCategoryLabel(slug)}
                </option>
              ))}
              {!COMMUNITY_CATEGORY_SLUGS.includes(form.category as (typeof COMMUNITY_CATEGORY_SLUGS)[number]) && (
                <option value={form.category}>{form.category}</option>
              )}
            </select>
          </label>

          <label className="admin-field">
            <span>Status</span>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  status: e.target.value as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
                }))
              }
            >
              <option value="PUBLISHED">Published (live)</option>
              <option value="ARCHIVED">Archived (hidden)</option>
              <option value="DRAFT">Draft (hidden)</option>
            </select>
          </label>
        </div>

        <label className="admin-field">
          <span>Tags <em>(comma-separated)</em></span>
          <input
            value={form.tags}
            onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
          />
        </label>

        <div className="admin-field-row">
          <label className="admin-field">
            <span>
              <input
                type="checkbox"
                checked={form.isAnonymous}
                onChange={(e) => setForm((f) => ({ ...f, isAnonymous: e.target.checked }))}
              />{' '}
              Anonymous author
            </span>
          </label>
          <label className="admin-field">
            <span>
              <input
                type="checkbox"
                checked={form.isPremium}
                onChange={(e) => setForm((f) => ({ ...f, isPremium: e.target.checked }))}
              />{' '}
              Premium-only
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
