'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';

type Props = {
  locale: Locale;
  username?: string | null;
};

export function BottomNav({ locale, username }: Props) {
  const pathname = usePathname();
  const cd = getCommunityDict(locale);
  const profileHref = username
    ? localePath(locale, `/u/${username}/`)
    : localePath(locale, '/login/');

  const items = [
    { href: localePath(locale, '/'), label: cd.bottomNav.home, icon: '🏠', match: (p: string) => p === localePath(locale, '/') || p === `/${locale}` || p === `/${locale}/` },
    {
      href: localePath(locale, '/conversationRoom/'),
      label: cd.nav.conversation,
      icon: '🗣️',
      match: (p: string) => p.startsWith(localePath(locale, '/conversationRoom')),
    },
    { href: localePath(locale, '/messages/'), label: cd.bottomNav.messages, icon: '✉️', match: (p: string) => p.startsWith(localePath(locale, '/messages')) },
    { href: profileHref, label: cd.bottomNav.profile, icon: '👤', match: (p: string) => p.startsWith(profileHref.replace(/\/$/, '')) || p.includes('/user') || p.includes('/login') || p.includes('/u/') },
  ];

  return (
    <nav className="bottom-nav" aria-label="მობილური ნავიგაცია">
      {items.map((item) => {
        const active = item.match(pathname);
        return (
          <Link key={item.href} href={item.href} className={active ? 'is-active' : ''} aria-current={active ? 'page' : undefined}>
            <span className="bottom-nav__icon" aria-hidden>{item.icon}</span>
            <span className="bottom-nav__label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
