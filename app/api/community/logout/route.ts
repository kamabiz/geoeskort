import { NextResponse } from 'next/server';
import { clearUserSessionCookie } from '@/lib/community/auth';

export async function POST() {
  await clearUserSessionCookie();
  return NextResponse.json({ ok: true });
}
