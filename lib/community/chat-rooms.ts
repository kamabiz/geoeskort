import { SOCKET_CONFIG } from '@/lib/community/socket-config';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';

export type PublicChatRoomKey = 'general' | 'gay';

export const PUBLIC_CHAT_ROOMS = {
  general: {
    key: 'general' as const,
    roomId: SOCKET_CONFIG.generalRoomId,
    path: '/conversationRoom/',
  },
  gay: {
    key: 'gay' as const,
    roomId: SOCKET_CONFIG.gayRoomId,
    path: '/gayChat/',
  },
} satisfies Record<PublicChatRoomKey, { key: PublicChatRoomKey; roomId: string; path: string }>;

export const PUBLIC_CHAT_ROOM_IDS = Object.values(PUBLIC_CHAT_ROOMS).map((room) => room.roomId);

export function isPublicChatPath(pathname: string, locale: Locale): boolean {
  const conversation = localePath(locale, PUBLIC_CHAT_ROOMS.general.path);
  const gayChat = localePath(locale, PUBLIC_CHAT_ROOMS.gay.path);
  return pathname.startsWith(conversation) || pathname.startsWith(gayChat);
}
