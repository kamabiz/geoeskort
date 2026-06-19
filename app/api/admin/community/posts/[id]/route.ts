import { NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/admin-api';
import { revalidateCommunityPost } from '@/lib/admin-community';
import { isCommunityCategorySlug } from '@/lib/community/categories';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireApiAuth();
  if (auth) return auth;

  const { id } = await params;
  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json();
  const data: {
    title?: string;
    body?: string;
    category?: string;
    tags?: string[];
    status?: 'DRAFT' | 'PUBLISHED';
    isAnonymous?: boolean;
    isPremium?: boolean;
  } = {};

  if (typeof body.title === 'string') {
    const title = body.title.trim();
    if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 });
    data.title = title;
  }
  if (typeof body.body === 'string') {
    const text = body.body.trim();
    if (!text) return NextResponse.json({ error: 'Body required' }, { status: 400 });
    data.body = text;
  }
  if (typeof body.category === 'string') {
    if (!isCommunityCategorySlug(body.category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }
    data.category = body.category;
  }
  if (Array.isArray(body.tags)) {
    data.tags = body.tags.filter((t: unknown) => typeof t === 'string').map((t: string) => t.trim().toLowerCase()).filter(Boolean);
  }
  if (body.status === 'DRAFT' || body.status === 'PUBLISHED') data.status = body.status;
  if (typeof body.isAnonymous === 'boolean') data.isAnonymous = body.isAnonymous;
  if (typeof body.isPremium === 'boolean') data.isPremium = body.isPremium;

  const post = await prisma.post.update({ where: { id }, data });
  await revalidateCommunityPost(post);
  return NextResponse.json({ ok: true, post });
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireApiAuth();
  if (auth) return auth;

  const { id } = await params;
  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.post.delete({ where: { id } });
  await revalidateCommunityPost(existing);
  return NextResponse.json({ ok: true });
}
