import { PublicChatRoomView } from '@/components/community/PublicChatRoomView';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { isLocale } from '@/lib/i18n/config';
import type { Locale } from '@/lib/i18n/types';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const cd = getCommunityDict(raw as Locale);
  return pageMetadata({ locale: raw as Locale, path: '/conversationRoom/', title: cd.conversation.title, description: cd.conversation.lead });
}

export default async function ConversationRoomPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return null;
  return <PublicChatRoomView locale={raw as Locale} roomKey="general" />;
}
