import type { Metadata, Viewport } from 'next';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} • Nightlife & Escort Guide Georgia +18`,
    template: `%s | ${SITE_NAME}`,
  },
  robots: { index: true, follow: true },
  verification: {
    google: 'prX0lzBLHWVvt8K3GtagSoMeDCZ9n26sMxo5LZlUi4Y',
  },
  icons: { icon: '/favicon.png', apple: '/favicon.png' },
};

export const viewport: Viewport = {
  themeColor: '#08080c',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ka" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
