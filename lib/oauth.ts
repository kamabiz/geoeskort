import 'server-only';

import { Google, Facebook, generateState, generateCodeVerifier } from 'arctic';
import { prisma } from '@/lib/prisma';
import { buildDefaultAvatarDataUri } from '@/lib/community/avatar';
import { normalizeUsername } from '@/lib/community/auth';

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';
}

export function createGoogleProvider() {
  const clientId = process.env.GOOGLE_CLIENT_ID ?? '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET ?? '';
  const redirectUri = `${getBaseUrl()}/api/auth/google/callback`;
  return new Google(clientId, clientSecret, redirectUri);
}

export function createFacebookProvider() {
  const clientId = process.env.FACEBOOK_CLIENT_ID ?? '';
  const clientSecret = process.env.FACEBOOK_CLIENT_SECRET ?? '';
  const redirectUri = `${getBaseUrl()}/api/auth/facebook/callback`;
  return new Facebook(clientId, clientSecret, redirectUri);
}

export { generateState, generateCodeVerifier };

export interface OAuthUserInfo {
  provider: 'google' | 'facebook';
  providerAccountId: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
}

async function buildUniqueUsername(base: string): Promise<string> {
  const normalized = normalizeUsername(base.replace(/\s+/g, '_'));
  const candidate = normalized.length >= 3 ? normalized : `user_${normalized}`;
  const existing = await prisma.user.findUnique({ where: { username: candidate } });
  if (!existing) return candidate;
  for (let i = 2; i <= 99; i++) {
    const suffixed = `${candidate}${i}`.slice(0, 24);
    const taken = await prisma.user.findUnique({ where: { username: suffixed } });
    if (!taken) return suffixed;
  }
  return `${candidate}_${Date.now().toString(36)}`.slice(0, 24);
}

export async function findOrCreateOAuthUser(info: OAuthUserInfo) {
  const existing = await prisma.oAuthAccount.findUnique({
    where: { provider_providerAccountId: { provider: info.provider, providerAccountId: info.providerAccountId } },
    include: { user: true },
  });

  if (existing) {
    return existing.user;
  }

  if (info.email) {
    const userByEmail = await prisma.user.findUnique({ where: { email: info.email } });
    if (userByEmail) {
      await prisma.oAuthAccount.create({
        data: { userId: userByEmail.id, provider: info.provider, providerAccountId: info.providerAccountId },
      });
      return userByEmail;
    }
  }

  const username = await buildUniqueUsername(info.name ?? info.email?.split('@')[0] ?? 'user');
  const gender = 'nonBinary' as const;
  const avatar = info.avatarUrl ?? buildDefaultAvatarDataUri({ username, gender });

  const user = await prisma.user.create({
    data: {
      username,
      email: info.email,
      gender,
      avatar,
      oauthAccounts: {
        create: { provider: info.provider, providerAccountId: info.providerAccountId },
      },
    },
  });

  return user;
}
