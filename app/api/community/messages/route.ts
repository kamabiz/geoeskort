import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/community/auth';
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
    senderUsername: m.sender.username,
    createdAt: m.createdAt.toISOString(),
    roomId: m.roomId,
    recipientId: m.recipientId,
  };
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
      ...(since ? { createdAt: { gt: new Date(since) } } : {}),
    },
    orderBy: { createdAt: 'asc' },
    take: 100,
    include: { sender: { select: { id: true, username: true, avatar: true } } },
  });

  return NextResponse.json({
    messages: messages.map(serializeMessage),
    socket: SOCKET_CONFIG,
  });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Login required' }, { status: 401 });
  }

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

  if (roomId === SOCKET_CONFIG.liveRoomId || recipientId) {
    const fresh = await prisma.user.findUnique({ where: { id: user.id }, select: { isPremium: true } });
    if (!fresh?.isPremium) {
      return NextResponse.json({ error: 'Premium required' }, { status: 403 });
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
