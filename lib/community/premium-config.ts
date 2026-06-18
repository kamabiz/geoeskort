import 'server-only';

/**
 * Premium tier toggle. Default: off (app is fully free).
 * Set PREMIUM_ENABLED=true to restore paid tier — see docs/PREMIUM-ARCHIVED.md
 */
export function isPremiumEnabled(): boolean {
  return process.env.PREMIUM_ENABLED === 'true';
}
