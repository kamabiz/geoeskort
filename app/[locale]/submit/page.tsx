import Link from 'next/link';
import { SubmitPostForm } from '@/components/community/SubmitPostForm';
import { isLocale } from '@/lib/i18n/config';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  return pageMetadata({
    locale: raw as Locale,
    path: '/submit/',
    title: 'Submit a story',
    description: 'Share your story with the community',
  });
}

export default async function SubmitPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return null;
  const locale = raw as Locale;

  return (
    <main className="container community-page">
      <div className="page-header community-page__header">
        <div>
          <h1>Submit a story</h1>
          <p>Logged-in or anonymous submissions welcome.</p>
        </div>
        <Link href={localePath(locale, '/')} className="btn btn--ghost">← Home</Link>
      </div>
      <SubmitPostForm locale={locale} />
    </main>
  );
}
