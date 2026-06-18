import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import type { Locale } from '@/lib/i18n/types';
import { pageMetadata } from '@/lib/seo';
import { notFound } from 'next/navigation';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  return pageMetadata({
    locale,
    path: '/contact/',
    title: dict.meta.contactTitle,
    description: dict.meta.contactDescription,
  });
}

export default async function ContactPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const dict = getDictionary(raw as Locale);

  return (
    <main className="container static-page">
      <h1>{dict.contact.title}</h1>
      <p>{dict.contact.p1}</p>
      <p>
        <strong>{dict.contact.email}</strong>{' '}
        <a href="mailto:kama.escorts@proton.me">kama.escorts@proton.me</a>
      </p>
      <p>
        {dict.contact.p2}{' '}
        <a href="https://kama.biz" rel="noopener noreferrer">
          KAMA.BIZ
        </a>
      </p>
    </main>
  );
}
