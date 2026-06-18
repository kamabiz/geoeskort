import { isLocale } from '@/lib/i18n/config';
import type { Locale } from '@/lib/i18n/types';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  return pageMetadata({ locale: raw as Locale, path: '/about/', title: 'About', description: 'About GEOESKORT community' });
}

export default async function AboutPage() {
  return (
    <main className="container community-page">
      <h1>About</h1>
      <p>GEOESKORT community is a place for stories, discussion, and advice — alongside our existing travel and nightlife blog.</p>
      <p>18+ adults only. Respect privacy and community guidelines.</p>
    </main>
  );
}
