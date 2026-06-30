import { JsonLd } from '@/components/JsonLd';
import { PublicChatRoomView } from '@/components/community/PublicChatRoomView';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { isLocale } from '@/lib/i18n/config';
import { absoluteUrl } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';
import { pageMetadata } from '@/lib/seo';
import { SITE_NAME } from '@/lib/site';

type Props = { params: Promise<{ locale: string }> };

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const cd = getCommunityDict(raw as Locale);
  return pageMetadata({
    locale: raw as Locale,
    path: '/gayChat/',
    title: cd.gayChat.metaTitle,
    description: cd.gayChat.metaDescription,
    keywords: cd.gayChat.metaKeywords,
    absolute: true,
  });
}

export default async function GayChatPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return null;
  const locale = raw as Locale;
  const cd = getCommunityDict(locale);

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: cd.gayChat.title,
          description: cd.gayChat.metaDescription,
          url: absoluteUrl(locale, '/gayChat/'),
          inLanguage: locale,
          isPartOf: {
            '@type': 'WebSite',
            name: SITE_NAME,
            url: absoluteUrl(locale, '/'),
          },
        }}
      />
      <PublicChatRoomView locale={locale} roomKey="gay" />
    </>
  );
}
