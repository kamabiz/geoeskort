import type { Dictionary } from '@/lib/i18n/types';

const KAMA_HREFS = [
  { href: 'https://kama.biz', key: 'featured' as const, label: 'KAMA.BIZ' },
  { href: 'https://kama.biz/tbilisi', key: 'tbilisi' as const, label: 'Tbilisi' },
  { href: 'https://kama.biz/batumi', key: 'batumi' as const, label: 'Batumi' },
  { href: 'https://kama.biz/girls', key: 'girls' as const, label: 'Girls' },
  { href: 'https://kama.biz/escorts', key: 'escorts' as const, label: 'Escorts' },
  { href: 'https://kama.biz/independent', key: 'independent' as const, label: 'Independent' },
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
        {KAMA_HREFS.map((link) => (
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
      {KAMA_HREFS.map((link) => {
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
            <span className="link-card__arrow">kama.biz/{link.key === 'featured' ? '' : link.key} →</span>
          </a>
        );
      })}
    </div>
  );
}
