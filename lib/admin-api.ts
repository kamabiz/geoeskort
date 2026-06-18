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
  revalidatePath('/', 'page');
  revalidatePath('/blog/', 'page');

  const { getAllRecordsAsync } = await import('@/lib/blog-store');
  const records = await getAllRecordsAsync();

  for (const record of records) {
    revalidatePath(`/blog/${record.slug}/`, 'page');
  }
}
