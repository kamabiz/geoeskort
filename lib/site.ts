export const SITE_URL = 'https://geoeskort.com';
export const SITE_NAME = 'Intimgram';
export const CONTACT_EMAIL = 'info@intimgram.com';
export const INTIMGRAM_URL = 'https://intimgram.com';
export const TOP_GE_SITE_ID = '118802';

export const INTIMGRAM_LINKS = [
  {
    href: INTIMGRAM_URL,
    icon: '⭐',
    title: 'INTIMGRAM – მთავარი',
    desc: '500+ გადამოწმებული escort პროფილი საქართველოში. VERIFIED badge, 24/7.',
    arrow: 'intimgram.com →',
    featured: true,
  },
  {
    href: `${INTIMGRAM_URL}/tbilisi`,
    icon: '🏙️',
    title: 'Escort Tbilisi',
    desc: 'ესკორტი თბილისი — ვაკე, საბურთalo, ვერა, ისანი.',
    arrow: 'intimgram.com/tbilisi →',
  },
  {
    href: `${INTIMGRAM_URL}/batumi`,
    icon: '🌊',
    title: 'Escort Batumi',
    desc: 'ბათუმის escort — საზღვაო კურორტი, nightlife სეზონი.',
    arrow: 'intimgram.com/batumi →',
  },
  {
    href: `${INTIMGRAM_URL}/girls`,
    icon: '✨',
    title: 'Eskort Gogoebi',
    desc: 'ესკორტ გოგონები თბილისში, ბათუმში და საქართველოში.',
    arrow: 'intimgram.com/girls →',
  },
  {
    href: `${INTIMGRAM_URL}/escorts`,
    icon: '💎',
    title: 'Escorts',
    desc: 'ყველა escort კატეგორია ერთ ადგილას.',
    arrow: 'intimgram.com/escorts →',
  },
  {
    href: `${INTIMGRAM_URL}/independent`,
    icon: '🦋',
    title: 'Independent',
    desc: 'დამოუკიდებელი escort პროფილები — პირდაპირი კონტაქტი.',
    arrow: 'intimgram.com/independent →',
  },
] as const;

/** @deprecated Use INTIMGRAM_LINKS */
export const KAMA_LINKS = INTIMGRAM_LINKS;
