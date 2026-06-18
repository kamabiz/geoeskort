import { NextRequest, NextResponse } from 'next/server';
import { revalidateBlog } from '@/lib/admin-api';
import { publishPost, verifyPublishApiKey, type PublishPostBody } from '@/lib/publish-post';

export async function POST(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (!verifyPublishApiKey(auth)) {
    return NextResponse.json({ error: 'Unauthorized — invalid or missing API key' }, { status: 401 });
  }

  let body: PublishPostBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  try {
    const post = await publishPost(body);
    if (post.status === 'published') {
      await revalidateBlog();
    }
    return NextResponse.json({
      success: true,
      postId: post.slug,
      slug: post.slug,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to publish post';
    const status = message.includes('already exists') ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
