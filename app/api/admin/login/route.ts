import { NextRequest, NextResponse } from 'next/server';
import {
  createSessionToken,
  setSessionCookie,
  verifyCredentials,
} from '@/lib/auth';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const username = String(body.username || '').trim();
  const password = String(body.password || '');

  if (!verifyCredentials(username, password)) {
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
  }

  const token = createSessionToken();
  await setSessionCookie(token);
  return NextResponse.json({ ok: true });
}
