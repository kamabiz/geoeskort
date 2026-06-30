'use client';

import Link from 'next/link';
import { SiteLogo } from '@/components/SiteLogo';
import { ProfileNavMenu } from '@/components/community/ProfileNavMenu';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { localePath } from '@/lib/i18n/paths';
import type { Dictionary, Locale } from '@/lib/i18n/types';

type HeaderProps = {
  locale: Locale;
  dict: Dictionary;
  username?: string | null;
  greetingHello?: string;
  greetingGuest?: string;
};

const MOBILE_MAX_WIDTH = 768;
const NAV_TOGGLE_RESERVE = 52;

export function Header({ locale, dict, username, greetingHello, greetingGuest }: HeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [compactNav, setCompactNav] = useState(false);
  const innerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLDivElement>(null);
  const cd = getCommunityDict(locale);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const profileHref = username
    ? localePath(locale, `/u/${username}/`)
    : localePath(locale, '/login/');

  const navPrimary = [
    { href: localePath(locale, '/'), label: dict.nav.home },
    { href: localePath(locale, '/history/'), label: cd.nav.history },
    { href: localePath(locale, '/questions/'), label: cd.nav.questions },
    { href: localePath(locale, '/conversationRoom/'), label: cd.nav.conversation },
  ];

  const navMore = [
    { href: localePath(locale, '/medical/'), label: cd.nav.medical },
    { href: localePath(locale, '/crush/'), label: cd.nav.crush },
    { href: localePath(locale, '/dating/'), label: cd.nav.dating },
  ];

  const navDesktop = [...navPrimary, ...navMore];
  const navAll = [...navDesktop];

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

  const evaluateNavFit = useCallback(() => {
    const inner = innerRef.current;
    const logo = logoRef.current;
    const probe = probeRef.current;

    if (!inner || !logo || !probe) return;

    if (window.innerWidth <= MOBILE_MAX_WIDTH) {
      setCompactNav(true);
      return;
    }

    const available = inner.clientWidth - logo.offsetWidth - NAV_TOGGLE_RESERVE;
    setCompactNav(probe.scrollWidth > available);
  }, []);

  useLayoutEffect(() => {
    evaluateNavFit();

    const inner = innerRef.current;
    const probe = probeRef.current;
    const logo = logoRef.current;
    if (!inner || !probe || !logo) return;

    const observer = new ResizeObserver(() => evaluateNavFit());
    observer.observe(inner);
    observer.observe(probe);
    observer.observe(logo);

    window.addEventListener('resize', evaluateNavFit);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', evaluateNavFit);
    };
  }, [evaluateNavFit, username, greetingHello, greetingGuest, cd.nav.profile]);

  const greetingBlock = greetingHello ? (
    <div className="site-nav__greeting">
      <span className="site-nav__greeting-text">
        {greetingHello},{' '}
        {username ? (
          <Link href={profileHref} className="site-nav__greeting-user">
            @{username}
          </Link>
        ) : (
          <span className="site-nav__greeting-user site-nav__greeting-user--guest">
            @{greetingGuest}
          </span>
        )}
      </span>
    </div>
  ) : null;

  const desktopLinks = navDesktop.map((item) => (
    <Link key={item.href} href={item.href} className={linkClass(item)}>
      {item.label}
    </Link>
  ));

  return (
    <header className={`site-header${compactNav ? ' site-header--compact-nav' : ''}`}>
      <div ref={innerRef} className="container site-header__inner">
        <div ref={logoRef} className="site-header__logo-wrap">
          <SiteLogo href={localePath(locale, '/')} />
        </div>
        <div ref={probeRef} className="site-nav__fit-probe" aria-hidden="true">
          <div className="site-nav__desktop site-nav__desktop--probe">
            {desktopLinks}
            {greetingBlock}
            <span className="site-nav__more-btn site-nav__link--profile site-nav__probe-profile">
              {cd.nav.profile}
              <span className="site-nav__more-caret" aria-hidden>
                ▾
              </span>
            </span>
          </div>
        </div>
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
            {desktopLinks.map((link, index) => (
              <Link
                key={navDesktop[index].href}
                href={navDesktop[index].href}
                className={linkClass(navDesktop[index])}
                onClick={() => setOpen(false)}
              >
                {navDesktop[index].label}
              </Link>
            ))}
            {greetingBlock}
            <ProfileNavMenu
              locale={locale}
              username={username ?? null}
              profileLabel={cd.nav.profile}
              settingsLabel={cd.user.settings}
              datingLabel={cd.user.dating}
              logoutLabel={cd.auth.logout}
              isProfileActive={isActive(profileHref)}
              variant="desktop"
            />
          </div>

          <div className="site-nav__mobile">
            {greetingHello && (
              <div className="site-nav__mobile-greeting">
                <span className="site-nav__greeting-text">
                  {greetingHello},{' '}
                  {username ? (
                    <Link
                      href={profileHref}
                      className="site-nav__greeting-user"
                      onClick={() => setOpen(false)}
                    >
                      @{username}
                    </Link>
                  ) : (
                    <span className="site-nav__greeting-user site-nav__greeting-user--guest">
                      @{greetingGuest}
                    </span>
                  )}
                </span>
              </div>
            )}
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
              profileLabel={cd.nav.profile}
              settingsLabel={cd.user.settings}
              datingLabel={cd.user.dating}
              logoutLabel={cd.auth.logout}
              isProfileActive={isActive(profileHref)}
              variant="mobile"
            />
          </div>
        </nav>
      </div>
      {open && (
        <button
          type="button"
          className="nav-backdrop"
          aria-label="დახურვა"
          onClick={() => setOpen(false)}
        />
      )}
    </header>
  );
}
