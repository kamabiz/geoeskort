import { ChatRoom } from '@/components/community/ChatRoom';
import { ChatRoomTabs } from '@/components/community/ChatRoomTabs';
import { PUBLIC_CHAT_ROOMS, type PublicChatRoomKey } from '@/lib/community/chat-rooms';
import { getCurrentUser } from '@/lib/community/auth';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';

type Props = {
  locale: Locale;
  roomKey: PublicChatRoomKey;
};

export async function PublicChatRoomView({ locale, roomKey }: Props) {
  const cd = getCommunityDict(locale);
  const user = await getCurrentUser();
  const room = PUBLIC_CHAT_ROOMS[roomKey];
  const copy = roomKey === 'gay' ? cd.gayChat : cd.conversation;

  return (
    <main className="chat-page-root">
      <ChatRoom
        title={copy.title}
        roomId={room.roomId}
        currentUserId={user?.id}
        labels={{
          send: cd.chat.send,
          placeholder: cd.chat.sendPlaceholder,
          loginRequired: copy.loginRequired,
        }}
        guestMode={!user}
        guestLabels={!user ? {
          limitTitle: copy.guestLimitTitle,
          limitBody: copy.guestLimitBody,
          register: copy.guestRegister,
          login: copy.guestLogin,
          close: copy.guestLimitClose,
          banner: copy.guestBanner,
          bannerUsed: copy.guestBannerUsed,
        } : undefined}
        registerHref={localePath(locale, '/register/')}
        loginHref={localePath(locale, '/login/')}
        tabs={(
          <ChatRoomTabs
            locale={locale}
            active={roomKey}
            labels={{
              general: cd.gayChat.tabGeneral,
              gay: cd.gayChat.tabGay,
            }}
          />
        )}
      />
    </main>
  );
}
