import type { Metadata, Viewport } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} • Nightlife & Escort გზამკვლევი საქართველოში +18`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'GEOESKORT – ღამის ცხოვრება, escort tbilisi, eskortebi საქართველოში. ინფორმაციული ბლოგი და სასარგებლო ლინკები KAMA.BIZ-ზე.',
  robots: { index: true, follow: true },
  verification: {
    google: 'prX0lzBLHWVvt8K3GtagSoMeDCZ9n26sMxo5LZlUi4Y',
  },
  icons: { icon: '/favicon.png', apple: '/favicon.png' },
  openGraph: {
    siteName: SITE_NAME,
    locale: 'ka_GE',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#08080c',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ka">
      <body>
        <div className="age-notice">18+ • Adults only • მხოლოდ სრულწლოვანთათვის</div>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
