import { redirect } from 'next/navigation';
import { isLocale } from '@/lib/i18n/config';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ success?: string; canceled?: string }>;
};

export default async function PremiumRedirectPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  const { success, canceled } = await searchParams;
  if (!isLocale(raw)) return null;
  const locale = raw as Locale;
  const qs = success ? '?success=1' : canceled ? '?canceled=1' : '';
  redirect(`${localePath(locale, '/user/subscription/')}${qs}`);
}
