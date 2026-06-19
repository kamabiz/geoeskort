'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Props = {
  className?: string;
  label?: string;
};

export function AdminLogoutButton({ className = 'admin-btn admin-btn--ghost admin-btn--sm', label = 'Log out' }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      await fetch('/api/admin/logout/', { method: 'POST' });
      router.push('/admin/login/');
      router.refresh();
    } catch {
      setLoading(false);
    }
  }

  return (
    <button type="button" className={className} onClick={logout} disabled={loading}>
      {loading ? '…' : label}
    </button>
  );
}
