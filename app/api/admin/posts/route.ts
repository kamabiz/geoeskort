import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth, revalidateBlog } from '@/lib/admin-api';
import { createPost, getAllPostsAsync } from '@/lib/blog-store';
import type { BlogPostInput } from '@/lib/types/blog';

export async function GET() {
  const auth = await requireApiAuth();
  if (auth) return auth;
  const posts = await getAllPostsAsync(true);
  return NextResponse.json({ posts });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiAuth();
  if (auth) return auth;

  try {
    const body = (await request.json()) as BlogPostInput;
    if (!body.title?.trim() || !body.slug?.trim() || !body.excerpt?.trim()) {
      return NextResponse.json({ error: 'Title, slug, and excerpt are required' }, { status: 400 });
    }
    const post = await createPost({
      slug: body.slug.trim(),
      title: body.title.trim(),
      seoTitle: body.seoTitle?.trim() || body.title.trim(),
      excerpt: body.excerpt.trim(),
      tags: body.tags || [],
      focusKeyword: body.focusKeyword?.trim() || '',
      publishedAt: body.publishedAt || new Date().toISOString().slice(0, 10),
      content: body.content || '',
    });
    await revalidateBlog();
    return NextResponse.json({ post }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to create post';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
