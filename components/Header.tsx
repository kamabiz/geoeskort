'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { locales, localeLabels } from '@/lib/i18n/config';
import { localePath, switchLocalePath } from '@/lib/i18n/paths';
import type { Dictionary, Locale } from '@/lib/i18n/types';

type HeaderProps = {
  locale: Locale;
  dict: Dictionary;
};

export function Header({ locale, dict }: HeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = [
    { href: localePath(locale, '/'), label: dict.nav.home },
    { href: localePath(locale, '/blog/'), label: dict.nav.blog },
    { href: localePath(locale, '/contact/'), label: dict.nav.contact },
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
          <a href="https://kama.biz" className="site-nav__cta" rel="noopener noreferrer">
            KAMA.BIZ →
          </a>
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
    </header>
  );
}
