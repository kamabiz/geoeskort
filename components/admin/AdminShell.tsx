import Link from 'next/link';
import { clearSessionCookie } from '@/lib/auth';
import { redirect } from 'next/navigation';

async function logoutAction() {
  'use server';
  await clearSessionCookie();
  redirect('/admin/login/');
}

type Section = 'blog' | 'community';

type Props = {
  children: React.ReactNode;
  section?: Section;
  minimal?: boolean;
  backHref?: string;
  backLabel?: string;
};

export function AdminShell({
  children,
  section,
  minimal,
  backHref = '/admin/',
  backLabel = '← Back',
}: Props) {
  if (minimal) {
    return (
      <div className="admin-shell">
        <header className="admin-header admin-header--minimal">
          <Link href={backHref} className="admin-header__brand">
            {backLabel}
          </Link>
        </header>
        {children}
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div className="admin-header__brand">
          <Link href="/admin/">
            GEO<span>ESKORT</span> Admin
          </Link>
        </div>
        <nav className="admin-header__nav">
          <Link
            href="/admin/"
            className={`admin-btn admin-btn--ghost admin-btn--sm${section === 'blog' ? ' admin-btn--nav-active' : ''}`}
          >
            Blog
          </Link>
          <Link
            href="/admin/community/"
            className={`admin-btn admin-btn--ghost admin-btn--sm${section === 'community' ? ' admin-btn--nav-active' : ''}`}
          >
            Stories &amp; chat
          </Link>
          <Link href="/" className="admin-btn admin-btn--ghost admin-btn--sm" target="_blank">
            View site ↗
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="admin-btn admin-btn--ghost admin-btn--sm">
              Log out
            </button>
          </form>
        </nav>
      </header>
      {children}
    </div>
  );
}
