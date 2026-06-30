/**
 * One-time backfill: replace id-based slugs with title-derived slugs.
 * Run after migration 0005: npx tsx scripts/backfill-post-slugs.ts
 */
import { PrismaClient } from '@prisma/client';
import { generateUniquePostSlug } from '../lib/community/post-slug';

const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.post.findMany({
    select: { id: true, title: true, slug: true },
    orderBy: { createdAt: 'asc' },
  });

  let updated = 0;
  for (const post of posts) {
    if (post.slug !== post.id) continue;
    const slug = await generateUniquePostSlug(post.title, post.id);
    await prisma.post.update({ where: { id: post.id }, data: { slug } });
    updated += 1;
    console.log(`${post.id} → ${slug}`);
  }

  console.log(`Done. Updated ${updated} of ${posts.length} posts.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
