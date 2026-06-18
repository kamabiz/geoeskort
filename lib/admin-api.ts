import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';

export async function requireApiAuth(): Promise<NextResponse | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function revalidateBlog(): Promise<void> {
  const { revalidatePath } = await import('next/cache');
  revalidatePath('/sitemap.xml');

  // App routes live under /[locale]/ — always revalidate internal locale paths
  for (const locale of ['ka', 'en', 'ru', 'tr']) {
    revalidatePath(`/${locale}`, 'page');
    revalidatePath(`/${locale}/blog`, 'page');
  }

  const { getAllPostsAsync } = await import('@/lib/blog-store');
  const posts = await getAllPostsAsync();
  for (const post of posts) {
    for (const locale of ['ka', 'en', 'ru', 'tr']) {
      revalidatePath(`/${locale}/blog/${post.slug}`, 'page');
    }
  }
}
