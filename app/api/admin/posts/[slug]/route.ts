import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth, revalidateBlog } from '@/lib/admin-api';
import { adminFormToRecord, recordToAdminForm, type AdminPostForm } from '@/lib/admin-blog';
import { deletePost, getRecordBySlugAsync, updatePost } from '@/lib/blog-store';

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const auth = await requireApiAuth();
  if (auth) return auth;
  const { slug } = await params;
  const record = await getRecordBySlugAsync(slug);
  if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ record, form: recordToAdminForm(record) });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requireApiAuth();
  if (auth) return auth;

  try {
    const { slug } = await params;
    const existing = await getRecordBySlugAsync(slug);
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const body = (await request.json()) as AdminPostForm;
    const record = adminFormToRecord(body);
    const saved = await updatePost(slug, record);
    await revalidateBlog();
    return NextResponse.json({ record: saved });
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
