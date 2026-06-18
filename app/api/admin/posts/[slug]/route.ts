import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth, revalidateBlog } from '@/lib/admin-api';
import { deletePost, getPostBySlugAsync, updatePost } from '@/lib/blog-store';
import type { BlogPostInput } from '@/lib/types/blog';

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const auth = await requireApiAuth();
  if (auth) return auth;
  const { slug } = await params;
  const post = await getPostBySlugAsync(slug);
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ post });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requireApiAuth();
  if (auth) return auth;

  try {
    const { slug } = await params;
    const body = (await request.json()) as BlogPostInput;
    const post = await updatePost(slug, {
      slug: body.slug.trim(),
      title: body.title.trim(),
      seoTitle: body.seoTitle?.trim() || body.title.trim(),
      excerpt: body.excerpt.trim(),
      tags: body.tags || [],
      focusKeyword: body.focusKeyword?.trim() || '',
      publishedAt: body.publishedAt,
      content: body.content || '',
    });
    await revalidateBlog();
    return NextResponse.json({ post });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to update post';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const auth = await requireApiAuth();
  if (auth) return auth;

  try {
    const { slug } = await params;
    await deletePost(slug);
    await revalidateBlog();
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to delete post';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
