'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type ItemType = 'posts' | 'comments' | 'messages';

type Props = {
  type: ItemType;
  id: string;
  archived: boolean;
  editHref: string;
  compact?: boolean;
};

export function CommunityModerationActions({ type, id, archived, editHref, compact }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function mutate(action: 'archive' | 'restore') {
    const label = action === 'archive' ? 'Archive' : 'Restore';
    const hint =
      action === 'archive'
        ? 'Hide from the site but keep in admin?'
        : 'Make this visible on the site again?';
    if (!confirm(`${label} this item?\n\n${hint}`)) return;

    setBusy(true);
    try {
      const res = await fetch(`/api/admin/community/${type}/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [action]: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `${label} failed`);
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : `${label} failed`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`admin-moderation-actions${compact ? ' admin-moderation-actions--compact' : ''}`}>
      <Link href={editHref} className="admin-btn admin-btn--sm">
        Edit
      </Link>
      {archived ? (
        <button
          type="button"
          className="admin-btn admin-btn--sm admin-btn--ghost"
          onClick={() => mutate('restore')}
          disabled={busy}
        >
          Restore
        </button>
      ) : (
        <button
          type="button"
          className="admin-btn admin-btn--sm admin-btn--ghost"
          onClick={() => mutate('archive')}
          disabled={busy}
        >
          Archive
        </button>
      )}
    </div>
  );
}

export function useCommunityModerationMutations(type: ItemType, id: string) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function archive() {
    if (!confirm('Archive this item? It will be hidden from the site but kept in admin.')) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/community/${type}/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archive: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Archive failed');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Archive failed');
    } finally {
      setBusy(false);
    }
  }

  async function restore() {
    if (!confirm('Restore this item? It will be visible on the site again.')) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/community/${type}/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restore: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Restore failed');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Restore failed');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm('Delete permanently? This cannot be undone.')) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/community/${type}/${id}/`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      router.push(`/admin/community/?tab=${type}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
      setBusy(false);
    }
  }

  return { archive, restore, remove, busy, error, setError };
}
