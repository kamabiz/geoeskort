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
  for (const locale of ['ka', 'en', 'ru', 'tr']) {
    const prefix = locale === 'ka' ? '' : `/${locale}`;
    revalidatePath(`${prefix}/blog/`, 'page');
    revalidatePath(`${prefix}/`, 'page');
  }
  // Revalidate all post pages
  const { getAllPostsAsync } = await import('@/lib/blog-store');
  const posts = await getAllPostsAsync();
  for (const post of posts) {
    for (const locale of ['ka', 'en', 'ru', 'tr']) {
      const prefix = locale === 'ka' ? '' : `/${locale}`;
      revalidatePath(`${prefix}/blog/${post.slug}/`, 'page');
    }
  }
}
