'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type CommentData = {
  id: string;
  body: string;
  isAnonymous: boolean;
  authorLabel: string;
  createdAt: string;
  post: { id: string; title: string; category: string; publicPath: string };
};

export function CommunityCommentEditor({ comment }: { comment: CommentData }) {
  const router = useRouter();
  const [body, setBody] = useState(comment.body);
  const [isAnonymous, setIsAnonymous] = useState(comment.isAnonymous);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function save() {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/admin/community/comments/${comment.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: body.trim(), isAnonymous }),
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

  async function remove() {
    if (!confirm('Delete this comment and its replies? This cannot be undone.')) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/community/comments/${comment.id}/`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      router.push('/admin/community/?tab=comments');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
      setSaving(false);
    }
  }

  return (
    <div className="admin-editor">
      <div className="admin-editor__top">
        <div>
          <h1>Edit comment</h1>
          <p className="admin-muted">
            {comment.authorLabel} · {new Date(comment.createdAt).toLocaleString('ka-GE')}
          </p>
          <p className="admin-muted">
            On post:{' '}
            <a href={comment.post.publicPath} target="_blank" rel="noopener">
              {comment.post.title}
            </a>
          </p>
        </div>
        <div className="admin-editor__actions">
          <button type="button" className="admin-btn admin-btn--danger" onClick={remove} disabled={saving}>
            Delete
          </button>
          <button type="button" className="admin-btn admin-btn--primary" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}
      {success && <div className="admin-alert admin-alert--success">{success}</div>}

      <div className="admin-card">
        <label className="admin-field">
          <span>Comment</span>
          <textarea rows={10} value={body} onChange={(e) => setBody(e.target.value)} />
        </label>
        <label className="admin-field">
          <span>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
            />{' '}
            Anonymous author
          </span>
        </label>
      </div>
    </div>
  );
}
