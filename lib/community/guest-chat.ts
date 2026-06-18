import 'server-only';

import crypto from 'crypto';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export const GUEST_CHAT_COOKIE = 'geoeskort_guest_chat';
export const GUEST_MESSAGE_LIMIT = 1;
const GUEST_SESSION_DAYS = 7;

type GuestChatSession = {
  guestUserId: string;
  messagesSent: number;
};

function getSecret(): string {
  return process.env.COMMUNITY_AUTH_SECRET || process.env.ADMIN_SECRET || 'dev-community-secret';
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('hex');
}

export function createGuestChatToken(guestUserId: string, messagesSent: number): string {
  const exp = Date.now() + GUEST_SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = `${guestUserId}:${messagesSent}:${exp}`;
  return Buffer.from(`${payload}:${sign(payload)}`).toString('base64url');
}

export function verifyGuestChatToken(token: string | undefined): GuestChatSession | null {
  if (!token) return null;
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    const lastColon = decoded.lastIndexOf(':');
    if (lastColon === -1) return null;
    const payload = decoded.slice(0, lastColon);
    const sig = decoded.slice(lastColon + 1);
    if (sign(payload) !== sig) return null;
    const [guestUserId, messagesSentRaw, exp] = payload.split(':');
    if (!guestUserId || !messagesSentRaw || !exp) return null;
    if (Date.now() > parseInt(exp, 10)) return null;
    const messagesSent = parseInt(messagesSentRaw, 10);
    if (Number.isNaN(messagesSent)) return null;
    return { guestUserId, messagesSent };
  } catch {
    return null;
  }
}

export async function getGuestChatSession(): Promise<GuestChatSession | null> {
  const jar = await cookies();
  return verifyGuestChatToken(jar.get(GUEST_CHAT_COOKIE)?.value);
}

export async function setGuestChatCookie(guestUserId: string, messagesSent: number): Promise<void> {
  const jar = await cookies();
  jar.set(GUEST_CHAT_COOKIE, createGuestChatToken(guestUserId, messagesSent), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: GUEST_SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function createGuestUser(): Promise<{ id: string; username: string }> {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const username = `guest_${crypto.randomBytes(4).toString('hex')}`;
    try {
      return await prisma.user.create({
        data: { username },
        select: { id: true, username: true },
      });
    } catch {
      // username collision — retry
    }
  }
  throw new Error('Could not create guest user');
}

export function guestMessagesRemaining(session: GuestChatSession | null): number {
  const sent = session?.messagesSent ?? 0;
  return Math.max(0, GUEST_MESSAGE_LIMIT - sent);
}

export function isGuestUsername(username: string): boolean {
  return username.startsWith('guest_');
}

export function displayChatUsername(username: string): string {
  return isGuestUsername(username) ? 'სტუმარი' : username;
}
