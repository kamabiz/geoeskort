import { redirect } from 'next/navigation';
import { getStoryViewPath } from '@/lib/community/categories';
import { isLocale } from '@/lib/i18n/config';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function LegacyPostRedirect({ params }: Props) {
  const { locale: raw, id } = await params;
  if (!isLocale(raw)) return null;
  redirect(localePath(raw as Locale, getStoryViewPath(id)));
}
