import 'server-only';

import type { User } from '@prisma/client';

export function canViewPremiumContent(user: Pick<User, 'isPremium'> | null, isPremiumPost: boolean): boolean {
  if (!isPremiumPost) return true;
  return !!user?.isPremium;
}

export const PREMIUM_LOCK_MESSAGE =
  'This content is available to Premium members';
