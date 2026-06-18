'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';

type Props = {
  locale: Locale;
  username?: string | null;
};

export function BottomNav({ locale, username }: Props) {
  const pathname = usePathname();
  const profileHref = username
    ? localePath(locale, `/u/${username}/`)
    : localePath(locale, '/login/');

  const items = [
    { href: localePath(locale, '/'), label: 'Home', icon: '🏠' },
    { href: localePath(locale, '/chat/'), label: 'Chat', icon: '💬' },
    { href: localePath(locale, '/messages/'), label: 'Messages', icon: '✉️' },
    { href: profileHref, label: 'Profile', icon: '👤' },
  ];

  return (
    <nav className="bottom-nav" aria-label="Mobile">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href.replace(/\/$/, ''));
        return (
          <Link key={item.href} href={item.href} className={active ? 'is-active' : ''}>
            <span aria-hidden>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
