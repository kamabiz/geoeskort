import Link from 'next/link';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';

type Props = {
  locale: Locale;
};

export function PremiumLockedBody({ locale }: Props) {
  const cd = getCommunityDict(locale);
  return (
    <div className="community-premium-lock">
      <p>{cd.common.premiumLock}</p>
      <Link href={localePath(locale, '/user/subscription/')} className="btn btn--primary">
        {cd.post.becomePremium}
      </Link>
    </div>
  );
}
