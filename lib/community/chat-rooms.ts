import { SOCKET_CONFIG } from '@/lib/community/socket-config';

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
