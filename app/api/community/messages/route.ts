import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SOCKET_CONFIG } from '@/lib/community/socket-config';

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
    messages: messages.map((m) => ({
      id: m.id,
      body: m.body,
      senderId: m.senderId,
      senderUsername: m.sender.username,
      createdAt: m.createdAt.toISOString(),
      roomId: m.roomId,
      recipientId: m.recipientId,
    })),
    socket: SOCKET_CONFIG,
  });
}
