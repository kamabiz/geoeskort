import { ChatRoom } from '@/components/community/ChatRoom';
import { getCurrentUser } from '@/lib/community/auth';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { isLocale } from '@/lib/i18n/config';
import { localePath } from '@/lib/i18n/paths';
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
  const locale = raw as Locale;
  const cd = getCommunityDict(locale);
  const user = await getCurrentUser();

  return (
    <main className="chat-page-root">
      <ChatRoom
        title={cd.conversation.title}
        roomId="general"
        currentUserId={user?.id}
        labels={{
          send: cd.chat.send,
          placeholder: cd.chat.sendPlaceholder,
          loginRequired: cd.conversation.loginRequired,
        }}
        guestMode={!user}
        guestLabels={!user ? {
          limitTitle: cd.conversation.guestLimitTitle,
          limitBody: cd.conversation.guestLimitBody,
          register: cd.conversation.guestRegister,
          login: cd.conversation.guestLogin,
          close: cd.conversation.guestLimitClose,
          banner: cd.conversation.guestBanner,
          bannerUsed: cd.conversation.guestBannerUsed,
        } : undefined}
        registerHref={localePath(locale, '/register/')}
        loginHref={localePath(locale, '/login/')}
      />
    </main>
  );
}
