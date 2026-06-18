import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/community/auth';
import { touchUserActivity } from '@/lib/community/presence';

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  await touchUserActivity(user.id);
  return NextResponse.json({ ok: true });
}
