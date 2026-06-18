import { isLocale } from '@/lib/i18n/config';
import type { Locale } from '@/lib/i18n/types';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  return pageMetadata({ locale: raw as Locale, path: '/rules/', title: 'Community rules', description: 'Community rules and guidelines' });
}

export default async function RulesPage() {
  return (
    <main className="container community-page">
      <h1>Community rules</h1>
      <ul className="community-rules">
        <li>18+ only — no content involving minors.</li>
        <li>Respect consent and privacy — no doxxing or harassment.</li>
        <li>No illegal content or spam.</li>
        <li>Anonymous posts are allowed; abuse may lead to bans.</li>
        <li>Premium content must still follow all platform rules.</li>
      </ul>
    </main>
  );
}
