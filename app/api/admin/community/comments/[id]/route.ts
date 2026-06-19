import { NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/admin-api';
import { revalidateCommunityComment } from '@/lib/admin-community';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireApiAuth();
  if (auth) return auth;

  const { id } = await params;
  const existing = await prisma.comment.findUnique({
    where: { id },
    include: { post: { select: { id: true, category: true } } },
  });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json();
  const data: { body?: string; isAnonymous?: boolean; archivedAt?: Date | null } = {};

  if (body.archive === true) data.archivedAt = new Date();
  if (body.restore === true) data.archivedAt = null;

  if (typeof body.body === 'string') {
    const text = body.body.trim();
    if (!text) return NextResponse.json({ error: 'Body required' }, { status: 400 });
    data.body = text;
  }
  if (typeof body.isAnonymous === 'boolean') data.isAnonymous = body.isAnonymous;

  const comment = await prisma.comment.update({ where: { id }, data });
  await revalidateCommunityComment(existing.post.id, existing.post.category);
  return NextResponse.json({ ok: true, comment });
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireApiAuth();
  if (auth) return auth;

  const { id } = await params;
  const existing = await prisma.comment.findUnique({
    where: { id },
    include: { post: { select: { id: true, category: true } } },
  });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.comment.delete({ where: { id } });
  await revalidateCommunityComment(existing.post.id, existing.post.category);
  return NextResponse.json({ ok: true });
}
