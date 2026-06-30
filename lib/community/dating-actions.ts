'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/community/auth';
import { parseAvatarGender } from '@/lib/community/avatar';
import {
  genderBucketFromPreset,
  parseDatingPresetCase,
} from '@/lib/community/dating-presets';
import { storeImageFile } from '@/lib/community/media';

export type DatingActionState = { error?: string; success?: string } | null;

const BIO_MAX_LENGTH = 300;
const BIO_MIN_LENGTH = 10;
const MAX_PHOTOS = 6;
const PHOTO_MAX_INPUT_BYTES = 5 * 1024 * 1024;

function revalidateDatingPaths(): void {
  revalidatePath('/dating/', 'page');
  revalidatePath('/user/dating/', 'page');
}

async function getOwnedProfile(userId: string) {
  return prisma.datingProfile.findUnique({
    where: { userId },
    include: { photos: { orderBy: { sortOrder: 'asc' } } },
  });
}

export async function upsertDatingProfile(
  _prev: DatingActionState,
  formData: FormData,
): Promise<DatingActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: 'loginRequired' };
  if (!process.env.DATABASE_URL) return { error: 'serviceUnavailable' };

  const presetCase = parseDatingPresetCase(String(formData.get('presetCase') || ''));
  if (!presetCase) return { error: 'invalidPreset' };

  const bio = String(formData.get('bio') || '').trim().slice(0, BIO_MAX_LENGTH);
  if (bio.length < BIO_MIN_LENGTH) return { error: 'bioTooShort' };

  const isVisible = formData.get('isVisible') !== 'off';
  const userGender = parseAvatarGender(user.gender ?? '');
  const genderBucket = genderBucketFromPreset(presetCase, userGender);

  try {
    await prisma.datingProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        presetCase,
        genderBucket,
        bio,
        isVisible,
      },
      update: {
        presetCase,
        genderBucket,
        bio,
        isVisible,
      },
    });

    revalidateDatingPaths();
    return { success: 'profileSaved' };
  } catch {
    return { error: 'serviceUnavailable' };
  }
}

export async function addDatingPhoto(
  _prev: DatingActionState,
  formData: FormData,
): Promise<DatingActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: 'loginRequired' };
  if (!process.env.DATABASE_URL) return { error: 'serviceUnavailable' };

  const file = formData.get('photoFile');
  if (!(file instanceof File) || file.size === 0) return { error: 'photoRequired' };

  try {
    let profile = await getOwnedProfile(user.id);
    if (!profile) {
      const userGender = parseAvatarGender(user.gender ?? '');
      profile = await prisma.datingProfile.create({
        data: {
          userId: user.id,
          presetCase: 'open_to_all',
          genderBucket: genderBucketFromPreset('open_to_all', userGender),
          bio: '',
        },
        include: { photos: { orderBy: { sortOrder: 'asc' } } },
      });
    }

    if (profile.photos.length >= MAX_PHOTOS) return { error: 'photoLimitReached' };

    const stored = await storeImageFile(`dating-profiles/${profile.id}`, file, {
      maxInputBytes: PHOTO_MAX_INPUT_BYTES,
      compress: true,
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 80,
    });
    if (typeof stored === 'object') {
      const errorKey = stored.error === 'invalidImageType' ? 'invalidPhotoType' : 'photoTooLarge';
      return { error: errorKey };
    }

    const nextOrder = profile.photos.length;
    await prisma.datingPhoto.create({
      data: {
        profileId: profile.id,
        url: stored,
        sortOrder: nextOrder,
      },
    });

    revalidateDatingPaths();
    return { success: 'photoAdded' };
  } catch {
    return { error: 'serviceUnavailable' };
  }
}

export async function removeDatingPhoto(
  _prev: DatingActionState,
  formData: FormData,
): Promise<DatingActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: 'loginRequired' };
  if (!process.env.DATABASE_URL) return { error: 'serviceUnavailable' };

  const photoId = String(formData.get('photoId') || '').trim();
  if (!photoId) return { error: 'photoNotFound' };

  try {
    const profile = await getOwnedProfile(user.id);
    if (!profile) return { error: 'profileNotFound' };

    const photo = profile.photos.find((p) => p.id === photoId);
    if (!photo) return { error: 'photoNotFound' };

    await prisma.datingPhoto.delete({ where: { id: photoId } });

    const remaining = profile.photos.filter((p) => p.id !== photoId);
    await Promise.all(
      remaining.map((p, index) =>
        prisma.datingPhoto.update({
          where: { id: p.id },
          data: { sortOrder: index },
        }),
      ),
    );

    revalidateDatingPaths();
    return { success: 'photoRemoved' };
  } catch {
    return { error: 'serviceUnavailable' };
  }
}
