import { NextResponse } from 'next/server';
import { BLOG_CATEGORIES, BLOG_CATEGORY_SLUGS } from '@/lib/blog-categories';
import { getStorageDiagnostics } from '@/lib/blog-store';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    categories: BLOG_CATEGORY_SLUGS,
    categoryMeta: Object.fromEntries(
      BLOG_CATEGORY_SLUGS.map((slug) => [
        slug,
        {
          label: BLOG_CATEGORIES[slug].label,
          description: BLOG_CATEGORIES[slug].description,
          emoji: BLOG_CATEGORIES[slug].emoji,
        },
      ]),
    ),
    ...getStorageDiagnostics(),
  });
}
