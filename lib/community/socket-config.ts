/** Socket.IO / realtime config stub. Falls back to polling when unavailable. */
export const SOCKET_CONFIG = {
  enabled: Boolean(process.env.NEXT_PUBLIC_SOCKET_URL),
  url: process.env.NEXT_PUBLIC_SOCKET_URL || '',
  pollingIntervalMs: 4000,
  generalRoomId: 'general',
  liveRoomId: 'live',
  gayRoomId: 'gay',
};

export type ChatMessagePayload = {
  id: string;
  body: string;
  senderId: string;
  senderUsername: string;
  createdAt: string;
  roomId?: string | null;
  recipientId?: string | null;
};
