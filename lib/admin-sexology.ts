import 'server-only';

import { computeReadingTimeMinutes } from '@/lib/community/text';
import { prisma } from '@/lib/prisma';

export type AdminSexologyForm = {
  title: string;
  body: string;
  tags: string[];
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  isAnonymous: boolean;
};

export type SexologyArticleRecord = {
  id: string;
  slug: string;
  title: string;
  body: string;
  tags: string[];
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  isAnonymous: boolean;
  createdAt: Date;
  viewCount: number;
};

export function recordToAdminForm(record: SexologyArticleRecord): AdminSexologyForm {
  return {
    title: record.title,
    body: record.body,
    tags: record.tags,
    status: record.status,
    isAnonymous: record.isAnonymous,
  };
}

export async function getSexologyArticles(includeDrafts = true) {
  return prisma.post.findMany({
    where: {
      category: 'sexology',
      ...(includeDrafts ? {} : { status: 'PUBLISHED' }),
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      body: true,
      tags: true,
      status: true,
      isAnonymous: true,
      createdAt: true,
      viewCount: true,
    },
  });
}

export async function getSexologyArticleById(id: string) {
  return prisma.post.findFirst({
    where: { id, category: 'sexology' },
    select: {
      id: true,
      slug: true,
      title: true,
      body: true,
      tags: true,
      status: true,
      isAnonymous: true,
      createdAt: true,
      viewCount: true,
    },
  });
}

export async function getSexologyArticleCount() {
  return prisma.post.count({ where: { category: 'sexology', status: 'PUBLISHED' } });
}

export function adminFormToPostData(form: AdminSexologyForm) {
  const title = form.title.trim();
  const body = form.body.trim();
  return {
    title,
    body,
    category: 'sexology' as const,
    tags: form.tags.map((t) => t.trim().toLowerCase()).filter(Boolean),
    status: form.status,
    isAnonymous: form.isAnonymous,
    isPremium: false,
    readingTimeMinutes: computeReadingTimeMinutes(body),
  };
}

export async function revalidateSexologyPaths(slug?: string): Promise<void> {
  const { revalidatePath } = await import('next/cache');
  revalidatePath('/medical/', 'page');
  revalidatePath('/', 'page');
  if (slug) {
    revalidatePath(`/history/${slug}/`, 'page');
  }
}
