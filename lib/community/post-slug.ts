import 'server-only';

import { slugify } from '@/lib/seo-analyze';
import { prisma } from '@/lib/prisma';

export async function generateUniquePostSlug(title: string, excludeId?: string): Promise<string> {
  const base = slugify(title) || 'post';
  let slug = base;
  let attempt = 0;

  while (attempt < 100) {
    const existing = await prisma.post.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return slug;
    attempt += 1;
    slug = `${base}-${attempt + 1}`;
  }

  return `${base}-${Date.now()}`;
}
