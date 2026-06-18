import Link from 'next/link';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="site-logo">
              GEO<span>ESKORT</span>
            </Link>
            <p>
              Nightlife &amp; escort გზამკვლევი საქართველოში. პროფილების კატალოგი —{' '}
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
              <h4>GEOESKORT</h4>
              <ul>
                <li><Link href="/blog/">ბლოგი</Link></li>
                <li><Link href="/contact">კონტაქტი</Link></li>
                <li><Link href="/privacy">კონფიდენციალურობა</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2026 GEOESKORT</span>
          <span>18+ • ინფორმაციული პორტალი • არა პროფილების კატალოგი</span>
        </div>
      </div>
    </footer>
  );
}
