import Link from 'next/link';
import { PREMIUM_LOCK_MESSAGE } from '@/lib/community/premium';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';

type Props = {
  locale: Locale;
};

export function PremiumLockedBody({ locale }: Props) {
  return (
    <div className="community-premium-lock">
      <p>{PREMIUM_LOCK_MESSAGE}</p>
      <Link href={localePath(locale, '/premium/')} className="btn btn--primary">
        Become Premium
      </Link>
    </div>
  );
}
