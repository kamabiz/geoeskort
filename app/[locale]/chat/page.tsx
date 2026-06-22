import { redirect } from 'next/navigation';
import { isLocale } from '@/lib/i18n/config';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';

type Props = { params: Promise<{ locale: string }> };

export default async function ChatPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return null;
  redirect(localePath(raw as Locale, '/conversationRoom/'));
}
