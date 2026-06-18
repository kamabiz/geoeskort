import type { Dictionary } from '@/lib/i18n/types';

const KAMA_HREFS = [
  { href: 'https://kama.biz', key: 'featured' as const, arrow: 'kama.biz →', featured: true },
  { href: 'https://kama.biz/tbilisi', key: 'tbilisi' as const, arrow: 'kama.biz/tbilisi →' },
  { href: 'https://kama.biz/batumi', key: 'batumi' as const, arrow: 'kama.biz/batumi →' },
  { href: 'https://kama.biz/girls', key: 'girls' as const, arrow: 'kama.biz/girls →' },
  { href: 'https://kama.biz/escorts', key: 'escorts' as const, arrow: 'kama.biz/escorts →' },
  { href: 'https://kama.biz/independent', key: 'independent' as const, arrow: 'kama.biz/independent →' },
];

const ICONS: Record<string, string> = {
  featured: '⭐',
  tbilisi: '🏙️',
  batumi: '🌊',
  girls: '✨',
  escorts: '💎',
  independent: '🦋',
};

export function KamaLinks({ dict }: { dict: Dictionary }) {
  return (
    <div className="link-grid">
      {KAMA_HREFS.map((link) => {
        const copy = dict.links[link.key];
        return (
          <a
            key={link.href}
            href={link.href}
            className={`link-card${link.featured ? ' link-card--featured' : ''}`}
            rel="noopener noreferrer"
          >
            <span className="link-card__icon">{ICONS[link.key]}</span>
            <h3 className="link-card__title">{copy.title}</h3>
            <p className="link-card__desc">{copy.desc}</p>
            <span className="link-card__arrow">{link.arrow}</span>
          </a>
        );
      })}
    </div>
  );
}
