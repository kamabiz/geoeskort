import { prisma } from '@/lib/prisma';
import {
  type DatingGenderBucket,
  type DatingPresetCase,
  parseDatingGenderBucket,
} from '@/lib/community/dating-presets';

export type DatingPhotoView = {
  id: string;
  url: string;
  sortOrder: number;
};

export type DatingProfileView = {
  id: string;
  userId: string;
  username: string;
  avatar: string | null;
  genderBucket: DatingGenderBucket;
  presetCase: DatingPresetCase;
  bio: string;
  isVisible: boolean;
  photos: DatingPhotoView[];
  updatedAt: Date;
};

const profileInclude = {
  user: { select: { username: true, avatar: true } },
  photos: { orderBy: { sortOrder: 'asc' as const } },
};

function mapProfile(
  row: {
    id: string;
    userId: string;
    genderBucket: string;
    presetCase: string;
    bio: string;
    isVisible: boolean;
    updatedAt: Date;
    user: { username: string; avatar: string | null };
    photos: { id: string; url: string; sortOrder: number }[];
  },
): DatingProfileView {
  return {
    id: row.id,
    userId: row.userId,
    username: row.user.username,
    avatar: row.user.avatar,
    genderBucket: row.genderBucket as DatingGenderBucket,
    presetCase: row.presetCase as DatingPresetCase,
    bio: row.bio,
    isVisible: row.isVisible,
    photos: row.photos,
    updatedAt: row.updatedAt,
  };
}

export async function getDatingProfileByUserId(userId: string): Promise<DatingProfileView | null> {
  const row = await prisma.datingProfile.findUnique({
    where: { userId },
    include: profileInclude,
  });
  return row ? mapProfile(row) : null;
}

export async function listDatingProfiles(options: {
  genderBucket?: DatingGenderBucket;
  limit?: number;
  skip?: number;
  excludeUserId?: string;
}): Promise<DatingProfileView[]> {
  const bucket = options.genderBucket ? parseDatingGenderBucket(options.genderBucket) : null;

  const rows = await prisma.datingProfile.findMany({
    where: {
      isVisible: true,
      ...(bucket ? { genderBucket: bucket } : {}),
      ...(options.excludeUserId ? { userId: { not: options.excludeUserId } } : {}),
      photos: { some: {} },
      bio: { not: '' },
    },
    include: profileInclude,
    orderBy: { updatedAt: 'desc' },
    take: options.limit ?? 24,
    skip: options.skip ?? 0,
  });

  return rows.map(mapProfile);
}
