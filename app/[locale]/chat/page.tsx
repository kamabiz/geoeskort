import { ChatRoom } from '@/components/community/ChatRoom';
import { isLocale } from '@/lib/i18n/config';
import type { Locale } from '@/lib/i18n/types';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  return pageMetadata({
    locale: raw as Locale,
    path: '/chat/',
    title: 'Community chat',
    description: 'General community chat room',
  });
}

export default async function ChatPage({ params }: Props) {
  await params;
  return (
    <main className="container community-page">
      <ChatRoom title="General chat room" />
    </main>
  );
}
