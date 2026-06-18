'use client';

import Link from 'next/link';
import { SiteLogo } from '@/components/SiteLogo';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { localePath } from '@/lib/i18n/paths';
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

  const navPrimary = [
    { href: localePath(locale, '/'), label: dict.nav.home },
    { href: localePath(locale, '/history/'), label: cd.nav.history },
    { href: localePath(locale, '/questions/'), label: cd.nav.questions },
    { href: localePath(locale, '/conversationRoom/'), label: cd.nav.conversation },
    { href: localePath(locale, '/chat/'), label: cd.nav.chat, live: true },
  ];

  const navMore = [
    { href: localePath(locale, '/medical/'), label: cd.nav.medical },
    { href: localePath(locale, '/crush/'), label: cd.nav.crush },
    { href: localePath(locale, '/messages/'), label: cd.nav.messages },
  ];

  const navAll = [
    ...navPrimary,
    ...navMore,
    { href: profileHref, label: cd.nav.profile, profile: true },
  ];

  const isActive = (href: string) => {
    const normalized = href.replace(/\/$/, '') || '/';
    const current = pathname.replace(/\/$/, '') || '/';
    if (normalized === '/') {
      return current === '/' || current === '';
    }
    return current === normalized || current.startsWith(normalized);
  };

  const isMoreActive = navMore.some((item) => isActive(item.href));

  const linkClass = (item: { href: string; live?: boolean; profile?: boolean }, extra = '') => {
    const classes = ['site-nav__link'];
    if (item.live) classes.push('site-nav__link--live');
    if (item.profile) classes.push('site-nav__link--profile');
    if (isActive(item.href)) classes.push('is-active');
    if (extra) classes.push(extra);
    return classes.join(' ');
  };

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <SiteLogo href={localePath(locale, '/')} />
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
          <div className="site-nav__desktop">
            {navPrimary.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={linkClass(item)}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className={`site-nav__more${isMoreActive ? ' is-active' : ''}`}>
              <button
                type="button"
                className="site-nav__more-btn"
                aria-expanded={false}
                aria-haspopup="true"
              >
                მეტი
                <span className="site-nav__more-caret" aria-hidden>▾</span>
              </button>
              <div className="site-nav__dropdown" role="menu">
                {navMore.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={linkClass(item, 'site-nav__dropdown-link')}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <Link
              href={profileHref}
              className={linkClass({ href: profileHref, profile: true })}
              onClick={() => setOpen(false)}
            >
              {cd.nav.profile}
            </Link>
          </div>

          <div className="site-nav__mobile">
            {navAll.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={linkClass(item)}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
      {open && <button type="button" className="nav-backdrop" aria-label="დახურვა" onClick={() => setOpen(false)} />}
    </header>
  );
}
