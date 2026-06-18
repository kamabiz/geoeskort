import Link from 'next/link';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { isLocale } from '@/lib/i18n/config';
import type { Locale } from '@/lib/i18n/types';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const cd = getCommunityDict(raw as Locale);
  return pageMetadata({ locale: raw as Locale, path: '/about/', title: cd.about.title, description: cd.about.p1 });
}

export default async function AboutPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return null;
  const cd = getCommunityDict(raw as Locale);

  return (
    <main className="container community-page">
      <h1>{cd.about.title}</h1>
      <p>{cd.about.p1}</p>
      <p>{cd.about.p2}</p>
    </main>
  );
}
