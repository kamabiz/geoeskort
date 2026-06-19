'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';

type Props = {
  locale: Locale;
  label: string;
  className?: string;
};

export function CommunityLogoutButton({
  locale,
  label,
  className = 'site-nav__logout',
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      await fetch('/api/community/logout/', { method: 'POST' });
      router.push(localePath(locale, '/'));
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
