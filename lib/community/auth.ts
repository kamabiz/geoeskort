import 'server-only';

import { cookies } from 'next/headers';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export const USER_SESSION_COOKIE = 'geoeskort_user';
const SESSION_DAYS = 30;

function getSecret(): string {
  return process.env.COMMUNITY_AUTH_SECRET || process.env.ADMIN_SECRET || 'dev-community-secret';
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('hex');
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64).toString('hex');
  if (candidate.length !== hash.length) return false;
  return crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(hash));
}

export function createUserSessionToken(userId: string): string {
  const exp = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = `${userId}:${exp}`;
  return Buffer.from(`${payload}:${sign(payload)}`).toString('base64url');
}

export function verifyUserSessionToken(token: string | undefined): string | null {
  if (!token) return null;
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    const lastColon = decoded.lastIndexOf(':');
    if (lastColon === -1) return null;
    const payload = decoded.slice(0, lastColon);
    const sig = decoded.slice(lastColon + 1);
    const [userId, exp] = payload.split(':');
    if (!userId || !exp) return null;
    if (Date.now() > parseInt(exp, 10)) return null;
    if (sign(payload) !== sig) return null;
    return userId;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const jar = await cookies();
  const userId = verifyUserSessionToken(jar.get(USER_SESSION_COOKIE)?.value);
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId } });
}

export async function setUserSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(USER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearUserSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(USER_SESSION_COOKIE);
}

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 24);
}
