'use client';

import Link from 'next/link';
import { SiteLogo } from '@/components/SiteLogo';
import { ProfileNavMenu } from '@/components/community/ProfileNavMenu';
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
    { href: localePath(locale, '/'), label: dict.nav.home, caps: cd.navCaps.home },
    { href: localePath(locale, '/history/'), label: cd.nav.history, caps: cd.navCaps.history },
    { href: localePath(locale, '/questions/'), label: cd.nav.questions, caps: cd.navCaps.questions },
    { href: localePath(locale, '/conversationRoom/'), label: cd.nav.conversation, caps: cd.navCaps.conversation },
  ];

  const navMore = [
    { href: localePath(locale, '/medical/'), label: cd.nav.medical, caps: cd.navCaps.medical },
    { href: localePath(locale, '/crush/'), label: cd.nav.crush, caps: cd.navCaps.crush },
  ];

  const navDesktop = [
    ...navPrimary,
    ...navMore,
  ];

  const navAll = [
    ...navDesktop,
  ];

  const isActive = (href: string) => {
    const normalized = href.replace(/\/$/, '') || '/';
    const current = pathname.replace(/\/$/, '') || '/';
    if (normalized === '/') {
      return current === '/' || current === '';
    }
    return current === normalized || current.startsWith(normalized);
  };

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
            {navDesktop.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={linkClass(item)}
                onClick={() => setOpen(false)}
              >
                <span className="site-nav__label-caps">{item.caps}</span>
              </Link>
            ))}
            <ProfileNavMenu
              locale={locale}
              username={username ?? null}
              profileCaps={cd.navCaps.profile}
              profileLabel={cd.nav.profile}
              logoutLabel={cd.auth.logout}
              isProfileActive={isActive(profileHref)}
              variant="desktop"
            />
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
            <ProfileNavMenu
              locale={locale}
              username={username ?? null}
              profileCaps={cd.navCaps.profile}
              profileLabel={cd.nav.profile}
              logoutLabel={cd.auth.logout}
              isProfileActive={isActive(profileHref)}
              variant="mobile"
            />
          </div>
        </nav>
      </div>
      {open && <button type="button" className="nav-backdrop" aria-label="დახურვა" onClick={() => setOpen(false)} />}
    </header>
  );
}
