import { KAMA_LINKS } from '@/lib/site';

export function KamaLinks() {
  return (
    <div className="link-grid">
      {KAMA_LINKS.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className={`link-card${'featured' in link && link.featured ? ' link-card--featured' : ''}`}
          rel="noopener noreferrer"
        >
          <span className="link-card__icon">{link.icon}</span>
          <h3 className="link-card__title">{link.title}</h3>
          <p className="link-card__desc">{link.desc}</p>
          <span className="link-card__arrow">{link.arrow}</span>
        </a>
      ))}
    </div>
  );
}
