import 'server-only';

import type { User } from '@prisma/client';
import { isPremiumEnabled } from '@/lib/community/premium-config';

export function canViewPremiumContent(user: Pick<User, 'isPremium'> | null, isPremiumPost: boolean): boolean {
  if (!isPremiumPost) return true;
  if (!isPremiumEnabled()) return true;
  return !!user?.isPremium;
}

export function userHasPremiumAccess(user: Pick<User, 'isPremium'> | null): boolean {
  if (!isPremiumEnabled()) return true;
  return !!user?.isPremium;
}

export const PREMIUM_LOCK_MESSAGE =
  'ეს მასალა მხოლოდ Premium წევრებს ხელმისაწვდომია';
