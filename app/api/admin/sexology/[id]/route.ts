import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/admin-api';
import {
  adminFormToPostData,
  getSexologyArticleById,
  revalidateSexologyPaths,
  type AdminSexologyForm,
} from '@/lib/admin-sexology';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requireApiAuth();
  if (auth) return auth;

  const { id } = await params;
  const existing = await getSexologyArticleById(id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    const body = (await request.json()) as AdminSexologyForm;
    if (!body.title?.trim() || !body.body?.trim()) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
    }

    const data = adminFormToPostData(body);
    const post = await prisma.post.update({ where: { id }, data });
    await revalidateSexologyPaths(post.slug);
    return NextResponse.json({ post: { id: post.id, title: post.title } });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to update article';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const auth = await requireApiAuth();
  if (auth) return auth;

  const { id } = await params;
  const existing = await getSexologyArticleById(id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.post.delete({ where: { id } });
  await revalidateSexologyPaths(existing.slug);
  return NextResponse.json({ ok: true });
}
