import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/admin-api';
import {
  adminFormToPostData,
  getSexologyArticles,
  revalidateSexologyPaths,
  type AdminSexologyForm,
} from '@/lib/admin-sexology';
import { generateUniquePostSlug } from '@/lib/community/post-slug';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const auth = await requireApiAuth();
  if (auth) return auth;

  const articles = await getSexologyArticles(true);
  return NextResponse.json({
    articles: articles.map((a) => ({
      id: a.id,
      title: a.title,
      status: a.status,
      tags: a.tags,
      createdAt: a.createdAt.toISOString(),
      viewCount: a.viewCount,
    })),
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiAuth();
  if (auth) return auth;

  try {
    const body = (await request.json()) as AdminSexologyForm;
    if (!body.title?.trim() || !body.body?.trim()) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
    }

    const data = adminFormToPostData(body);
    const slug = await generateUniquePostSlug(data.title);
    const post = await prisma.post.create({ data: { ...data, slug } });
    await revalidateSexologyPaths(post.slug);
    return NextResponse.json({ post: { id: post.id, title: post.title } }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to create article';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
