'use client';

import Link from 'next/link';
import { CommunityLogoutButton } from '@/components/community/CommunityLogoutButton';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';

type Props = {
  locale: Locale;
  username: string | null;
  profileCaps: string;
  profileLabel: string;
  logoutLabel: string;
  isProfileActive: boolean;
  variant?: 'desktop' | 'mobile';
};

export function ProfileNavMenu({
  locale,
  username,
  profileCaps,
  profileLabel,
  logoutLabel,
  isProfileActive,
  variant = 'desktop',
}: Props) {
  const profileHref = username
    ? localePath(locale, `/u/${username}/`)
    : localePath(locale, '/login/');

  if (!username) {
    return (
      <Link
        href={profileHref}
        className={[
          'site-nav__link',
          'site-nav__link--profile',
          isProfileActive ? 'is-active' : '',
        ].filter(Boolean).join(' ')}
      >
        {variant === 'desktop' ? (
          <span className="site-nav__label-caps">{profileCaps}</span>
        ) : (
          profileLabel
        )}
      </Link>
    );
  }

  if (variant === 'mobile') {
    return (
      <details className="site-nav__profile-menu site-nav__profile-menu--mobile">
        <summary className="site-nav__link site-nav__link--profile">
          {profileLabel}
        </summary>
        <div className="site-nav__profile-menu-items">
          <Link href={profileHref} className="site-nav__link site-nav__profile-menu-item">
            {profileLabel}
          </Link>
          <CommunityLogoutButton
            locale={locale}
            label={logoutLabel}
            className="site-nav__link site-nav__logout site-nav__profile-menu-item"
          />
        </div>
      </details>
    );
  }

  return (
    <div className={`site-nav__more site-nav__profile${isProfileActive ? ' is-active' : ''}`}>
      <button
        type="button"
        className="site-nav__more-btn site-nav__link--profile"
        aria-haspopup="menu"
        aria-expanded="false"
      >
        <span className="site-nav__label-caps">{profileCaps}</span>
        <span className="site-nav__more-caret" aria-hidden>▾</span>
      </button>
      <div className="site-nav__dropdown" role="menu">
        <Link
          href={profileHref}
          className="site-nav__link site-nav__dropdown-link"
          role="menuitem"
        >
          {profileLabel}
        </Link>
        <CommunityLogoutButton
          locale={locale}
          label={logoutLabel}
          className="site-nav__link site-nav__dropdown-link site-nav__logout site-nav__logout--menu"
        />
      </div>
    </div>
  );
}
