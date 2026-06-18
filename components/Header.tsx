'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { locales, localeLabels } from '@/lib/i18n/config';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { localePath, switchLocalePath } from '@/lib/i18n/paths';
import type { Dictionary, Locale } from '@/lib/i18n/types';

type HeaderProps = {
  locale: Locale;
  dict: Dictionary;
  username?: string | null;
};

export function Header({ locale, dict, username }: HeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const cd = getCommunityDict(locale);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const profileHref = username
    ? localePath(locale, `/u/${username}/`)
    : localePath(locale, '/login/');

  const nav = [
    { href: localePath(locale, '/'), label: dict.nav.home },
    { href: localePath(locale, '/history/'), label: cd.nav.history },
    { href: localePath(locale, '/questions/'), label: cd.nav.questions },
    { href: localePath(locale, '/medical/'), label: cd.nav.medical },
    { href: localePath(locale, '/crush/'), label: cd.nav.crush },
    { href: localePath(locale, '/conversationRoom/'), label: cd.nav.conversation },
    { href: localePath(locale, '/chat/'), label: cd.nav.chat },
    { href: localePath(locale, '/messages/'), label: cd.nav.messages },
    { href: profileHref, label: cd.nav.profile },
  ];

  const isActive = (href: string) => {
    const normalized = href.replace(/\/$/, '') || '/';
    const current = pathname.replace(/\/$/, '') || '/';
    if (normalized === localePath(locale, '/').replace(/\/$/, '') || '/') {
      return current === normalized || (locale !== 'ka' && current === `/${locale}`);
    }
    return current === normalized || current.startsWith(normalized);
  };

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link href={localePath(locale, '/')} className="site-logo">
          GEO<span>ESKORT</span>
        </Link>
        <button
          className="nav-toggle"
          type="button"
          aria-label={dict.nav.menu}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? '✕' : '☰'}
        </button>
        <nav className={`site-nav${open ? ' is-open' : ''}`} aria-label="Main">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={isActive(item.href) ? 'is-active' : ''}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="lang-switcher" role="group" aria-label="Language">
            {locales.map((l) => (
              <Link
                key={l}
                href={switchLocalePath(pathname, l)}
                className={l === locale ? 'is-active' : ''}
                aria-current={l === locale ? 'true' : undefined}
                onClick={() => setOpen(false)}
              >
                {localeLabels[l]}
              </Link>
            ))}
          </div>
        </nav>
      </div>
      {open && <button type="button" className="nav-backdrop" aria-label="დახურვა" onClick={() => setOpen(false)} />}
    </header>
  );
}
