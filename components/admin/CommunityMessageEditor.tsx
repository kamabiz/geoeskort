'use client';

import { useState } from 'react';
import { useCommunityModerationMutations } from '@/components/admin/CommunityModerationActions';

type MessageData = {
  id: string;
  body: string;
  roomId: string | null;
  archived: boolean;
  senderLabel: string;
  recipientLabel: string | null;
  createdAt: string;
};

export function CommunityMessageEditor({ message }: { message: MessageData }) {
  const { archive, restore, remove, busy, error, setError } = useCommunityModerationMutations('messages', message.id);
  const [body, setBody] = useState(message.body);
  const [saving, setSaving] = useState(false);
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
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
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
          {message.archived && (
            <p className="admin-badge admin-badge--warn" style={{ display: 'inline-block', marginTop: '0.5rem' }}>
              Archived — hidden from site
            </p>
          )}
        </div>
        <div className="admin-editor__actions">
          {message.archived ? (
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
          <span>Message</span>
          <textarea rows={8} value={body} onChange={(e) => setBody(e.target.value)} />
        </label>
      </div>
    </div>
  );
}
