import 'server-only';

import { cookies } from 'next/headers';
import crypto from 'crypto';
import { redirect } from 'next/navigation';

export const SESSION_COOKIE = 'geoeskort_admin';
const SESSION_DAYS = 7;

function getSecret(): string {
  return process.env.ADMIN_SECRET || 'dev-secret-change-in-production';
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('hex');
}

export function createSessionToken(): string {
  const exp = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = `admin:${exp}`;
  return Buffer.from(`${payload}:${sign(payload)}`).toString('base64url');
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    const lastColon = decoded.lastIndexOf(':');
    if (lastColon === -1) return false;
    const payload = decoded.slice(0, lastColon);
    const sig = decoded.slice(lastColon + 1);
    const [user, exp] = payload.split(':');
    if (user !== 'admin' || !exp) return false;
    if (Date.now() > parseInt(exp, 10)) return false;
    return sign(payload) === sig;
  } catch {
    return false;
  }
}

export function verifyCredentials(username: string, password: string): boolean {
  const expectedUser = process.env.ADMIN_USERNAME || 'adminuser';
  const expectedPass = process.env.ADMIN_PASSWORD || '';
  if (!expectedPass) return false;
  if (username.length !== expectedUser.length || password.length !== expectedPass.length) {
    return false;
  }
  const userMatch = crypto.timingSafeEqual(Buffer.from(username), Buffer.from(expectedUser));
  const passMatch = crypto.timingSafeEqual(Buffer.from(password), Buffer.from(expectedPass));
  return userMatch && passMatch;
}

export async function getSession(): Promise<boolean> {
  const jar = await cookies();
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}

export async function requireAuth(): Promise<void> {
  if (!(await getSession())) redirect('/admin/login/');
}

export async function setSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}
