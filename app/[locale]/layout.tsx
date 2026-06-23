import { notFound } from 'next/navigation';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { AgeGate } from '@/components/community/AgeGate';
import { BottomNav } from '@/components/community/BottomNav';
import { PresenceHeartbeat } from '@/components/community/PresenceHeartbeat';
import { SetHtmlLang } from '@/components/SetHtmlLang';
import { getCurrentUser } from '@/lib/community/auth';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { locales, isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import type { Locale } from '@/lib/i18n/types';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const cd = getCommunityDict(locale);
  const user = await getCurrentUser();

  return (
    <>
      <SetHtmlLang locale={locale} />
      <AgeGate dict={cd.ageGate} />
      <Header
        locale={locale}
        dict={dict}
        username={user?.username}
        greetingHello={cd.home.greetingHello}
        greetingGuest={cd.home.greetingGuest}
      />
      <PresenceHeartbeat />
      {children}
      <Footer locale={locale} dict={dict} username={user?.username} />
      <BottomNav locale={locale} username={user?.username} />
    </>
  );
}
