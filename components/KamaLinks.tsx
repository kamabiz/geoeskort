import type { Dictionary } from '@/lib/i18n/types';
import { INTIMGRAM_URL } from '@/lib/site';

const INTIMGRAM_HREFS = [
  { href: INTIMGRAM_URL, key: 'featured' as const, label: 'INTIMGRAM' },
  { href: `${INTIMGRAM_URL}/tbilisi`, key: 'tbilisi' as const, label: 'Tbilisi' },
  { href: `${INTIMGRAM_URL}/batumi`, key: 'batumi' as const, label: 'Batumi' },
  { href: `${INTIMGRAM_URL}/girls`, key: 'girls' as const, label: 'Girls' },
  { href: `${INTIMGRAM_URL}/escorts`, key: 'escorts' as const, label: 'Escorts' },
  { href: `${INTIMGRAM_URL}/independent`, key: 'independent' as const, label: 'Independent' },
];

const ICONS: Record<string, string> = {
  featured: '⭐',
  tbilisi: '🏙️',
  batumi: '🌊',
  girls: '✨',
  escorts: '💎',
  independent: '🦋',
};

type Props = {
  dict: Dictionary;
  compact?: boolean;
};

export function KamaLinks({ dict, compact = false }: Props) {
  if (compact) {
    return (
      <nav className="links-compact__nav" aria-label={dict.links.title}>
        {INTIMGRAM_HREFS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={`links-compact__link${link.key === 'featured' ? ' links-compact__link--featured' : ''}`}
            rel="noopener noreferrer"
          >
            <span aria-hidden>{ICONS[link.key]}</span>
            {link.label}
          </a>
        ))}
      </nav>
    );
  }

  return (
    <div className="link-grid">
      {INTIMGRAM_HREFS.map((link) => {
        const copy = dict.links[link.key];
        return (
          <a
            key={link.href}
            href={link.href}
            className={`link-card${link.key === 'featured' ? ' link-card--featured' : ''}`}
            rel="noopener noreferrer"
          >
            <span className="link-card__icon">{ICONS[link.key]}</span>
            <h3 className="link-card__title">{copy.title}</h3>
            <p className="link-card__desc">{copy.desc}</p>
            <span className="link-card__arrow">intimgram.com/{link.key === 'featured' ? '' : link.key} →</span>
          </a>
        );
      })}
    </div>
  );
}
