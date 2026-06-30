'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import {
  createUserSessionToken,
  getCurrentUser,
  hashPassword,
  normalizeUsername,
  setUserSessionCookie,
  verifyPassword,
} from '@/lib/community/auth';
import { buildDefaultAvatarDataUri, parseAvatarGender } from '@/lib/community/avatar';
import { storeImageFile } from '@/lib/community/media';

export type SettingsActionState = { error?: string; success?: string } | null;

const AVATAR_MAX_BYTES = 512 * 1024;

function parseEmail(raw: string): string | null {
  const email = raw.trim().toLowerCase();
  if (!email) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

async function storeAvatarFile(userId: string, file: File): Promise<string | { error: string }> {
  const stored = await storeImageFile(`avatars/${userId}`, file, {
    maxInputBytes: AVATAR_MAX_BYTES,
    compress: false,
  });
  if (typeof stored === 'object') {
    if (stored.error === 'invalidImageType') return { error: 'invalidAvatarType' };
    if (stored.error === 'imageTooLarge') return { error: 'avatarTooLarge' };
    return stored;
  }
  return stored;
}

function revalidateUserPaths(username: string, oldUsername?: string): void {
  revalidatePath(`/u/${username}/`, 'page');
  revalidatePath('/user/settings/', 'page');
  if (oldUsername && oldUsername !== username) {
    revalidatePath(`/u/${oldUsername}/`, 'page');
  }
}

export async function updateProfileUsername(
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: 'loginRequired' };
  if (!process.env.DATABASE_URL) return { error: 'serviceUnavailable' };

  const username = normalizeUsername(String(formData.get('username') || ''));
  if (!username || username.length < 3) return { error: 'usernameTooShort' };
  if (username === user.username) return { success: 'usernameUpdated' };

  try {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing && existing.id !== user.id) return { error: 'usernameTaken' };

    await prisma.user.update({
      where: { id: user.id },
      data: { username },
    });

    await setUserSessionCookie(createUserSessionToken(user.id));
    revalidateUserPaths(username, user.username);
  } catch {
    return { error: 'serviceUnavailable' };
  }

  redirect('/u/' + username + '/');
}

export async function updateProfileEmail(
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: 'loginRequired' };
  if (!process.env.DATABASE_URL) return { error: 'serviceUnavailable' };

  const rawEmail = String(formData.get('email') || '');
  const email = rawEmail.trim() ? parseEmail(rawEmail) : null;
  if (rawEmail.trim() && !email) return { error: 'invalidEmail' };

  try {
    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== user.id) return { error: 'emailTaken' };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { email },
    });

    revalidateUserPaths(user.username);
    return { success: 'emailUpdated' };
  } catch {
    return { error: 'serviceUnavailable' };
  }
}

export async function updateProfilePassword(
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: 'loginRequired' };
  if (!user.passwordHash) return { error: 'noPasswordSet' };
  if (!process.env.DATABASE_URL) return { error: 'serviceUnavailable' };

  const currentPassword = String(formData.get('currentPassword') || '');
  const newPassword = String(formData.get('newPassword') || '');
  const confirmPassword = String(formData.get('confirmPassword') || '');

  if (!verifyPassword(currentPassword, user.passwordHash)) {
    return { error: 'invalidCurrentPassword' };
  }
  if (newPassword.length < 6) return { error: 'passwordTooShort' };
  if (newPassword !== confirmPassword) return { error: 'passwordMismatch' };

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashPassword(newPassword) },
    });
    return { success: 'passwordUpdated' };
  } catch {
    return { error: 'serviceUnavailable' };
  }
}

export async function updateProfileAvatar(
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: 'loginRequired' };
  if (!process.env.DATABASE_URL) return { error: 'serviceUnavailable' };

  const gender = parseAvatarGender(String(formData.get('gender') || ''));
  const file = formData.get('avatarFile');
  let avatar: string | null = null;

  if (file instanceof File && file.size > 0) {
    const stored = await storeAvatarFile(user.id, file);
    if (typeof stored === 'object') return { error: stored.error };
    avatar = stored;
  } else if (gender) {
    avatar = buildDefaultAvatarDataUri({
      username: user.username,
      gender,
    });
  } else {
    return { error: 'avatarRequired' };
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        avatar,
        ...(gender ? { gender } : {}),
      },
    });

    revalidateUserPaths(user.username);
    return { success: 'avatarUpdated' };
  } catch {
    return { error: 'serviceUnavailable' };
  }
}
