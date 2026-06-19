'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type MessageData = {
  id: string;
  body: string;
  roomId: string | null;
  senderLabel: string;
  recipientLabel: string | null;
  createdAt: string;
};

export function CommunityMessageEditor({ message }: { message: MessageData }) {
  const router = useRouter();
  const [body, setBody] = useState(message.body);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function save() {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/admin/community/messages/${message.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: body.trim() }),
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
    if (!confirm('Delete this message? This cannot be undone.')) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/community/messages/${message.id}/`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      router.push('/admin/community/?tab=messages');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
      setSaving(false);
    }
  }

  const context =
    message.roomId != null
      ? `Live chat · room ${message.roomId}`
      : message.recipientLabel
        ? `DM: ${message.senderLabel} → ${message.recipientLabel}`
        : `From ${message.senderLabel}`;

  return (
    <div className="admin-editor">
      <div className="admin-editor__top">
        <div>
          <h1>Edit message</h1>
          <p className="admin-muted">
            {context} · {new Date(message.createdAt).toLocaleString('ka-GE')}
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
          <span>Message</span>
          <textarea rows={8} value={body} onChange={(e) => setBody(e.target.value)} />
        </label>
      </div>
    </div>
  );
}
