'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { PostStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  createUserSessionToken,
  getCurrentUser,
  hashPassword,
  normalizeUsername,
  setUserSessionCookie,
  verifyPassword,
} from '@/lib/community/auth';
import { isCommunityCategorySlug } from '@/lib/community/categories';
import { awardPoints } from '@/lib/community/points';
import { computeReadingTimeMinutes } from '@/lib/community/text';
import { touchUserActivity } from '@/lib/community/presence';

function parseTags(raw: string): string[] {
  return [...new Set(raw.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean))].slice(0, 8);
}

export async function registerUser(formData: FormData) {
  const username = normalizeUsername(String(formData.get('username') || ''));
  const password = String(formData.get('password') || '');
  const email = String(formData.get('email') || '').trim() || null;

  if (!username || username.length < 3) throw new Error('Username must be at least 3 characters');
  if (password.length < 6) throw new Error('Password must be at least 6 characters');

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) throw new Error('Username already taken');

  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash: hashPassword(password),
    },
  });

  await setUserSessionCookie(createUserSessionToken(user.id));
  redirect('/u/' + username + '/');
}

export async function loginUser(formData: FormData) {
  const username = normalizeUsername(String(formData.get('username') || ''));
  const password = String(formData.get('password') || '');

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user?.passwordHash || !verifyPassword(password, user.passwordHash)) {
    throw new Error('Invalid username or password');
  }

  await setUserSessionCookie(createUserSessionToken(user.id));
  await touchUserActivity(user.id);
  redirect('/u/' + user.username + '/');
}

export async function submitPost(formData: FormData) {
  const user = await getCurrentUser();
  const title = String(formData.get('title') || '').trim();
  const body = String(formData.get('body') || '').trim();
  const category = String(formData.get('category') || '').trim();
  const tags = parseTags(String(formData.get('tags') || ''));
  const isAnonymous = formData.get('anonymous') === 'on';
  const isPremium = formData.get('isPremium') === 'on';

  if (!title || title.length < 5) throw new Error('Title is too short');
  if (!body || body.length < 20) throw new Error('Story body is too short');
  if (!isCommunityCategorySlug(category)) throw new Error('Invalid category');

  const post = await prisma.post.create({
    data: {
      title,
      body,
      category,
      tags,
      isAnonymous: isAnonymous || !user,
      isPremium,
      authorId: user?.id ?? null,
      readingTimeMinutes: computeReadingTimeMinutes(body),
      status: PostStatus.PUBLISHED,
    },
  });

  if (user) {
    await awardPoints(user.id, 'POST_PUBLISHED', post.id);
    await touchUserActivity(user.id);
  }

  revalidatePath('/');
  redirect('/p/' + post.id + '/');
}

export async function createComment(formData: FormData) {
  const user = await getCurrentUser();
  const postId = String(formData.get('postId') || '');
  const body = String(formData.get('body') || '').trim();
  const parentId = String(formData.get('parentId') || '') || null;
  const isAnonymous = formData.get('anonymous') === 'on';

  if (!postId || !body) throw new Error('Comment cannot be empty');

  if (parentId) {
    const parent = await prisma.comment.findUnique({ where: { id: parentId } });
    if (!parent || parent.parentId) throw new Error('Invalid reply target');
  }

  const comment = await prisma.comment.create({
    data: {
      postId,
      body,
      parentId,
      authorId: user?.id ?? null,
      isAnonymous: isAnonymous || !user,
    },
    include: { post: { select: { authorId: true } } },
  });

  if (comment.post.authorId) {
    await awardPoints(comment.post.authorId, 'COMMENT_RECEIVED', comment.id);
  }
  if (user) await touchUserActivity(user.id);

  revalidatePath('/p/' + postId + '/');
}

export async function upvotePost(postId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Login required');

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new Error('Post not found');

  const existing = await prisma.postUpvote.findUnique({
    where: { userId_postId: { userId: user.id, postId } },
  });
  if (existing) return;

  await prisma.postUpvote.create({ data: { userId: user.id, postId } });
  if (post.authorId) await awardPoints(post.authorId, 'POST_UPVOTED', postId);
  await touchUserActivity(user.id);
  revalidatePath('/p/' + postId + '/');
}

export async function sendChatMessage(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Login required');

  const body = String(formData.get('body') || '').trim();
  const roomId = String(formData.get('roomId') || 'general');
  const recipientId = String(formData.get('recipientId') || '') || null;

  if (!body) throw new Error('Message cannot be empty');

  await prisma.message.create({
    data: {
      senderId: user.id,
      body,
      roomId: recipientId ? null : roomId,
      recipientId,
    },
  });

  await touchUserActivity(user.id);
  revalidatePath(recipientId ? '/messages/' : '/chat/');
}

export async function heartbeat() {
  const user = await getCurrentUser();
  if (!user) return;
  await touchUserActivity(user.id);
}
