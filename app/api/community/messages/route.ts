import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/community/auth';
import {
  createGuestUser,
  displayChatUsername,
  getGuestChatSession,
  guestMessagesRemaining,
  GUEST_MESSAGE_LIMIT,
  setGuestChatCookie,
} from '@/lib/community/guest-chat';
import { isPremiumEnabled } from '@/lib/community/premium-config';
import { touchUserActivity } from '@/lib/community/presence';
import { prisma } from '@/lib/prisma';
import { SOCKET_CONFIG } from '@/lib/community/socket-config';

function serializeMessage(m: {
  id: string;
  body: string;
  senderId: string;
  createdAt: Date;
  roomId: string | null;
  recipientId: string | null;
  sender: { username: string };
}) {
  return {
    id: m.id,
    body: m.body,
    senderId: m.senderId,
    senderUsername: displayChatUsername(m.sender.username),
    createdAt: m.createdAt.toISOString(),
    roomId: m.roomId,
    recipientId: m.recipientId,
  };
}

const GUEST_ALLOWED_ROOMS = [SOCKET_CONFIG.liveRoomId, SOCKET_CONFIG.generalRoomId];

function guestStatusResponse(roomId: string, recipientId: string | null) {
  if (!GUEST_ALLOWED_ROOMS.includes(roomId) || recipientId) return null;
  return getGuestChatSession().then((session) => ({
    messagesRemaining: guestMessagesRemaining(session),
    limit: GUEST_MESSAGE_LIMIT,
  }));
}

export async function GET(request: NextRequest) {
  const roomId = request.nextUrl.searchParams.get('roomId') || SOCKET_CONFIG.generalRoomId;
  const recipientId = request.nextUrl.searchParams.get('recipientId');
  const peerId = request.nextUrl.searchParams.get('peerId');
  const since = request.nextUrl.searchParams.get('since');

  const where =
    recipientId && peerId
      ? {
          OR: [
            { senderId: peerId, recipientId },
            { senderId: recipientId, recipientId: peerId },
          ],
        }
      : { roomId };

  const messages = await prisma.message.findMany({
    where: {
      ...where,
      archivedAt: null,
      ...(since ? { createdAt: { gt: new Date(since) } } : {}),
    },
    orderBy: { createdAt: 'asc' },
    take: 100,
    include: { sender: { select: { id: true, username: true, avatar: true } } },
  });

  const user = await getCurrentUser();
  const guestStatus =
    !user && GUEST_ALLOWED_ROOMS.includes(roomId) && !recipientId
      ? await guestStatusResponse(roomId, recipientId)
      : null;

  return NextResponse.json({
    messages: messages.map(serializeMessage),
    guestStatus,
    socket: SOCKET_CONFIG,
  });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  let payload: { body?: string; roomId?: string; recipientId?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const body = String(payload.body || '').trim();
  const roomId = String(payload.roomId || SOCKET_CONFIG.generalRoomId);
  const recipientId = String(payload.recipientId || '') || null;

  if (!body) {
    return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
  }

  if (!user) {
    if (!GUEST_ALLOWED_ROOMS.includes(roomId) || recipientId) {
      return NextResponse.json({ error: 'Login required' }, { status: 401 });
    }

    const session = await getGuestChatSession();
    if (guestMessagesRemaining(session) <= 0) {
      return NextResponse.json(
        { error: 'Guest limit reached', code: 'GUEST_LIMIT' },
        { status: 403 },
      );
    }

    let guestUserId = session?.guestUserId;
    if (!guestUserId) {
      const guest = await createGuestUser();
      guestUserId = guest.id;
    }

    const message = await prisma.message.create({
      data: {
        senderId: guestUserId,
        body,
        roomId,
      },
      include: { sender: { select: { username: true } } },
    });

    const messagesSent = (session?.messagesSent ?? 0) + 1;
    await setGuestChatCookie(guestUserId, messagesSent);

    return NextResponse.json({
      message: serializeMessage(message),
      guestStatus: {
        messagesRemaining: guestMessagesRemaining({ guestUserId, messagesSent }),
        limit: GUEST_MESSAGE_LIMIT,
      },
    });
  }

  if (roomId === SOCKET_CONFIG.liveRoomId || recipientId) {
    if (isPremiumEnabled()) {
      const fresh = await prisma.user.findUnique({ where: { id: user.id }, select: { isPremium: true } });
      if (!fresh?.isPremium) {
        return NextResponse.json({ error: 'Premium required' }, { status: 403 });
      }
    }
  }

  const message = await prisma.message.create({
    data: {
      senderId: user.id,
      body,
      roomId: recipientId ? null : roomId,
      recipientId,
    },
    include: { sender: { select: { username: true } } },
  });

  await touchUserActivity(user.id);

  return NextResponse.json({ message: serializeMessage(message) });
}
