import { NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/admin-api';
import { countBlogArticles, useBlogDatabase } from '@/lib/blog-db';
import { getStorageDiagnostics, importLegacyBlogToDatabase } from '@/lib/blog-store';

export async function POST() {
  const auth = await requireApiAuth();
  if (auth) return auth;

  if (!useBlogDatabase()) {
    return NextResponse.json({ error: 'DATABASE_URL not configured' }, { status: 503 });
  }

  try {
    const before = await countBlogArticles();
    const result = await importLegacyBlogToDatabase();
    const after = await countBlogArticles();
    return NextResponse.json({
      ok: true,
      before,
      after,
      ...result,
      diagnostics: getStorageDiagnostics(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Import failed' },
      { status: 500 },
    );
  }
}
