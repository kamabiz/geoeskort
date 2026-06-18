'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href.replace(/\/$/, ''));
  };

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link href="/" className="site-logo">
          GEO<span>ESKORT</span>
        </Link>
        <button
          className="nav-toggle"
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? '✕' : '☰'}
        </button>
        <nav className={`site-nav${open ? ' is-open' : ''}`} aria-label="Main">
          <Link href="/" className={isActive('/') ? 'is-active' : ''} onClick={() => setOpen(false)}>
            მთავარი
          </Link>
          <Link href="/blog/" className={isActive('/blog') ? 'is-active' : ''} onClick={() => setOpen(false)}>
            ბლოგი
          </Link>
          <Link href="/contact" className={isActive('/contact') ? 'is-active' : ''} onClick={() => setOpen(false)}>
            კონტაქტი
          </Link>
          <a href="https://kama.biz" className="site-nav__cta" rel="noopener noreferrer">
            KAMA.BIZ →
          </a>
        </nav>
      </div>
    </header>
  );
}
