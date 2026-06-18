import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth, revalidateBlog } from '@/lib/admin-api';
import { adminFormToRecord, recordPrimaryTitle, type AdminPostForm } from '@/lib/admin-blog';
import { createPost, getAllRecordsAsync } from '@/lib/blog-store';
import { getCategoryEmoji } from '@/lib/blog-categories';

export async function GET() {
  const auth = await requireApiAuth();
  if (auth) return auth;
  const records = await getAllRecordsAsync(true);
  const posts = records.map((record) => ({
    slug: record.slug,
    title: recordPrimaryTitle(record),
    category: record.category,
    emoji: getCategoryEmoji(record.category),
    publishedAt: record.publishedAt,
    status: record.status,
  }));
  return NextResponse.json({ posts });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiAuth();
  if (auth) return auth;

  try {
    const body = (await request.json()) as AdminPostForm;
    if (!body.title?.trim() || !body.slug?.trim()) {
      return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 });
    }
    const record = adminFormToRecord(body);
    const saved = await createPost(record);
    await revalidateBlog();
    return NextResponse.json({ record: saved }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to create post';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
