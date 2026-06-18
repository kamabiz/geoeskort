import type { Metadata, Viewport } from 'next';
import { Grand_Hotel } from 'next/font/google';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import './globals.css';

const logoFont = Grand_Hotel({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-logo',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} • ქართული 18+ პლატფორმა`,
    template: `%s | ${SITE_NAME}`,
  },
  robots: { index: true, follow: true },
  verification: {
    google: 'prX0lzBLHWVvt8K3GtagSoMeDCZ9n26sMxo5LZlUi4Y',
  },
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png', sizes: '96x96' },
      { url: '/favicon.ico', sizes: '96x96' },
    ],
    apple: [{ url: '/favicon.png', sizes: '96x96' }],
    shortcut: '/favicon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#08080c',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ka" className={logoFont.variable} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
