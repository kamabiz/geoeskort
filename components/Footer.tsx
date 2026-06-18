import Link from 'next/link';
import { SiteLogo } from '@/components/SiteLogo';
import { TopGeCounter } from '@/components/TopGeCounter';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { localePath } from '@/lib/i18n/paths';
import type { Dictionary, Locale } from '@/lib/i18n/types';

type Props = {
  locale: Locale;
  dict: Dictionary;
  username?: string | null;
};

export function Footer({ locale, dict, username }: Props) {
  const cd = getCommunityDict(locale);
  const profileHref = username
    ? localePath(locale, `/u/${username}/`)
    : localePath(locale, '/login/');

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <SiteLogo href={localePath(locale, '/')} />
            <p>{dict.footer.tagline}</p>
          </div>

          <div className="footer-links">
            <div className="footer-col">
              <h4>{cd.footer.modules}</h4>
              <ul>
                <li><Link href={localePath(locale, '/history/')}>{cd.nav.history}</Link></li>
                <li><Link href={localePath(locale, '/questions/')}>{cd.nav.questions}</Link></li>
                <li><Link href={localePath(locale, '/medical/')}>{cd.nav.medical}</Link></li>
                <li><Link href={localePath(locale, '/crush/')}>{cd.nav.crush}</Link></li>
                <li><Link href={localePath(locale, '/positionVariants/')}>{cd.nav.positions}</Link></li>
                <li><Link href={localePath(locale, '/zodiac/')}>{cd.nav.zodiac}</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>{cd.footer.chat}</h4>
              <ul>
                <li><Link href={localePath(locale, '/conversationRoom/')}>{cd.nav.conversation}</Link></li>
                <li><Link href={localePath(locale, '/chat/')}>{cd.nav.chat}</Link></li>
                <li><Link href={localePath(locale, '/messages/')}>{cd.nav.messages}</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>{cd.footer.account}</h4>
              <ul>
                <li><Link href={localePath(locale, '/login/')}>{cd.auth.login}</Link></li>
                <li><Link href={localePath(locale, '/register/')}>{cd.auth.register}</Link></li>
                <li><Link href={profileHref}>{cd.nav.profile}</Link></li>
                <li><Link href={localePath(locale, '/points/')}>{dict.footer.points}</Link></li>
                <li><Link href={localePath(locale, '/user/subscription/')}>{dict.footer.premium}</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>{cd.footer.info}</h4>
              <ul>
                <li><Link href={localePath(locale, '/blog/')}>{dict.footer.blog}</Link></li>
                <li><Link href={localePath(locale, '/aboutUs/')}>{dict.footer.about}</Link></li>
                <li><Link href={localePath(locale, '/rules/')}>{dict.footer.rules}</Link></li>
                <li><Link href={localePath(locale, '/privacy/')}>{dict.footer.privacy}</Link></li>
                <li><Link href={localePath(locale, '/contact/')}>{dict.footer.contact}</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>&copy; 2026 Intimgram</span>
          <TopGeCounter />
          <span>{dict.footer.legal}</span>
        </div>
      </div>
    </footer>
  );
}
