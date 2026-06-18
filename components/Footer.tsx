import Link from 'next/link';
import { localePath } from '@/lib/i18n/paths';
import type { Dictionary, Locale } from '@/lib/i18n/types';

export function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href={localePath(locale, '/')} className="site-logo">
              GEO<span>ESKORT</span>
            </Link>
            <p>
              {dict.footer.tagline.split('KAMA.BIZ')[0]}
              <a href="https://kama.biz" rel="noopener noreferrer">
                KAMA.BIZ
              </a>
            </p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>KAMA.BIZ</h4>
              <ul>
                <li><a href="https://kama.biz/tbilisi" rel="noopener noreferrer">Escort Tbilisi</a></li>
                <li><a href="https://kama.biz/batumi" rel="noopener noreferrer">Escort Batumi</a></li>
                <li><a href="https://kama.biz/girls" rel="noopener noreferrer">Eskort Gogoebi</a></li>
                <li><a href="https://kama.biz/escorts" rel="noopener noreferrer">Escorts</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>{dict.footer.geoeskort}</h4>
              <ul>
                <li><Link href={localePath(locale, '/blog/')}>{dict.footer.blog}</Link></li>
                <li><Link href={localePath(locale, '/contact/')}>{dict.footer.contact}</Link></li>
                <li><Link href={localePath(locale, '/privacy/')}>{dict.footer.privacy}</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2026 GEOESKORT</span>
          <span>{dict.footer.legal}</span>
        </div>
      </div>
    </footer>
  );
}
