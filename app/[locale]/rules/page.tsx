import { getCommunityDict } from '@/lib/i18n/community-dict';
import { isLocale } from '@/lib/i18n/config';
import type { Locale } from '@/lib/i18n/types';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const cd = getCommunityDict(raw as Locale);
  return pageMetadata({ locale: raw as Locale, path: '/rules/', title: cd.rules.title, description: cd.rules.title });
}

export default async function RulesPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return null;
  const cd = getCommunityDict(raw as Locale);

  return (
    <main className="container community-page">
      <h1>{cd.rules.title}</h1>
      <ul className="community-rules">
        {cd.rules.items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </main>
  );
}
