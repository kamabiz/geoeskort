import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import type { Locale } from '@/lib/i18n/types';
import { pageMetadata } from '@/lib/seo';
import { CONTACT_EMAIL } from '@/lib/site';
import { notFound } from 'next/navigation';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  return pageMetadata({
    locale,
    path: '/privacy/',
    title: dict.meta.privacyTitle,
    description: dict.meta.privacyDescription,
  });
}

export default async function PrivacyPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const dict = getDictionary(raw as Locale);

  return (
    <main className="container static-page">
      <h1>{dict.privacy.title}</h1>
      <p>{dict.privacy.p1}</p>
      <p>{dict.privacy.p2}</p>
      <p>
        {dict.privacy.p3}{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
    </main>
  );
}
