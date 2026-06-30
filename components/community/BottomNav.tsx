'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';

type Props = {
  locale: Locale;
  username?: string | null;
};

function isChatPath(pathname: string, locale: Locale): boolean {
  const conversation = localePath(locale, '/conversationRoom/');
  const gayChat = localePath(locale, '/gayChat/');
  return pathname.startsWith(conversation) || pathname.startsWith(gayChat);
}

export function BottomNav({ locale, username }: Props) {
  const pathname = usePathname();
  const cd = getCommunityDict(locale);
  const [expanded, setExpanded] = useState(false);
  const isChatPage = isChatPath(pathname, locale);

  const profileHref = username
    ? localePath(locale, `/u/${username}/`)
    : localePath(locale, '/login/');

  const items = [
    { href: localePath(locale, '/'), label: cd.bottomNav.home, icon: '🏠', match: (p: string) => p === localePath(locale, '/') || p === `/${locale}` || p === `/${locale}/` },
    {
      href: localePath(locale, '/conversationRoom/'),
      label: cd.bottomNav.chat,
      icon: '💬',
      match: (p: string) =>
        p.startsWith(localePath(locale, '/conversationRoom')) ||
        p.startsWith(localePath(locale, '/gayChat')),
    },
    { href: localePath(locale, '/messages/'), label: cd.bottomNav.messages, icon: '✉️', match: (p: string) => p.startsWith(localePath(locale, '/messages')) },
    { href: profileHref, label: cd.bottomNav.profile, icon: '👤', match: (p: string) => p.startsWith(profileHref.replace(/\/$/, '')) || p.includes('/user') || p.includes('/login') || p.includes('/u/') },
  ];

  useEffect(() => {
    setExpanded(false);
  }, [pathname]);

  useEffect(() => {
    if (!isChatPage || !expanded) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setExpanded(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isChatPage, expanded]);

  const navClassName = [
    'bottom-nav',
    isChatPage ? 'bottom-nav--chat' : '',
    isChatPage && expanded ? 'is-expanded' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      {isChatPage && expanded && (
        <button
          type="button"
          className="bottom-nav__backdrop"
          onClick={() => setExpanded(false)}
          aria-label="ნავიგაციის დამალვა"
        />
      )}

      {isChatPage && (
        <button
          type="button"
          className={`bottom-nav__fab${expanded ? ' is-open' : ''}`}
          onClick={() => setExpanded((open) => !open)}
          aria-label={expanded ? 'ნავიგაციის დამალვა' : 'ნავიგაციის გახსნა'}
          aria-expanded={expanded}
          aria-controls="mobile-bottom-nav"
        >
          {expanded ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 7H20M4 12H20M4 17H14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      )}

      <nav id="mobile-bottom-nav" className={navClassName} aria-label="მობილური ნავიგაცია">
        {items.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? 'is-active' : ''}
              aria-current={active ? 'page' : undefined}
              onClick={() => setExpanded(false)}
            >
              <span className="bottom-nav__icon" aria-hidden>{item.icon}</span>
              <span className="bottom-nav__label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
