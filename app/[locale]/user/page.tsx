import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/community/auth';
import { isLocale } from '@/lib/i18n/config';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';

type Props = { params: Promise<{ locale: string }> };

export default async function UserPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return null;
  const locale = raw as Locale;
  const user = await getCurrentUser();

  if (user) {
    redirect(localePath(locale, `/u/${user.username}/`));
  }
  redirect(localePath(locale, '/login/'));
}
