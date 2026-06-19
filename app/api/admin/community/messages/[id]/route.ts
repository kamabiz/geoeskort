import { NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/admin-api';
import { revalidateCommunityMessages } from '@/lib/admin-community';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireApiAuth();
  if (auth) return auth;

  const { id } = await params;
  const existing = await prisma.message.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json();
  const data: { body?: string; archivedAt?: Date | null } = {};

  if (body.archive === true) data.archivedAt = new Date();
  if (body.restore === true) data.archivedAt = null;

  if (typeof body.body === 'string') {
    const text = body.body.trim();
    if (!text) return NextResponse.json({ error: 'Body required' }, { status: 400 });
    data.body = text;
  }

  const message = await prisma.message.update({ where: { id }, data });
  await revalidateCommunityMessages();
  return NextResponse.json({ ok: true, message });
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireApiAuth();
  if (auth) return auth;

  const { id } = await params;
  const existing = await prisma.message.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.message.delete({ where: { id } });
  await revalidateCommunityMessages();
  return NextResponse.json({ ok: true });
}
