import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from './site';

type PageMeta = {
  title: string;
  description: string;
  path?: string;
  ogType?: 'website' | 'article';
  absolute?: boolean;
};

export function pageMetadata({
  title,
  description,
  path = '',
  ogType = 'website',
  absolute = false,
}: PageMeta): Metadata {
  const url = `${SITE_URL}${path}`;

  return {
    title: absolute ? { absolute: title } : title,
    description,
    robots: { index: true, follow: true },
    alternates: { canonical: url },
    openGraph: {
      type: ogType,
      url,
      title,
      description,
      siteName: SITE_NAME,
      locale: 'ka_GE',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}
