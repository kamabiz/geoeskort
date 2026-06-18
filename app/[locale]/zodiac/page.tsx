import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ZodiacTool } from '@/components/community/ZodiacTool';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { isLocale } from '@/lib/i18n/config';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const cd = getCommunityDict(raw as Locale);
  return pageMetadata({ locale: raw as Locale, path: '/zodiac/', title: cd.zodiac.title, description: cd.zodiac.lead });
}

export default async function ZodiacPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const cd = getCommunityDict(locale);

  return (
    <main className="container community-page">
      <div className="page-header">
        <h1>{cd.zodiac.title}</h1>
        <p className="community-page__lead">{cd.zodiac.lead}</p>
      </div>
      <ZodiacTool dict={cd.zodiac} />
      <p style={{ marginTop: '1.5rem' }}>
        <Link href={localePath(locale, '/')} className="btn btn--ghost">{cd.post.back}</Link>
      </p>
    </main>
  );
}
