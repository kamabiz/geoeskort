import Link from 'next/link';
import { PremiumCheckoutButton } from '@/components/community/PremiumCheckoutButton';
import { getCurrentUser } from '@/lib/community/auth';
import { isLocale } from '@/lib/i18n/config';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';
import { pageMetadata } from '@/lib/seo';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ success?: string; canceled?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  return pageMetadata({
    locale: raw as Locale,
    path: '/premium/',
    title: 'Premium membership',
    description: 'Unlock premium stories, chat perks, and more',
  });
}

export default async function PremiumPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  const { success, canceled } = await searchParams;
  if (!isLocale(raw)) return null;
  const locale = raw as Locale;
  const user = await getCurrentUser();

  return (
    <main className="container community-page">
      <div className="community-premium-hero">
        <h1>Premium membership</h1>
        <p>Unlock restricted stories, premium chat visibility, and supporter perks.</p>
        {success && <p className="community-form__success">Welcome to Premium! 🎉</p>}
        {canceled && <p className="community-form__error">Checkout canceled.</p>}
        {user?.isPremium ? (
          <p>You are already a Premium member.</p>
        ) : user ? (
          <PremiumCheckoutButton />
        ) : (
          <p>
            <Link href={localePath(locale, '/login/')} className="btn btn--primary">Log in to subscribe</Link>
          </p>
        )}
        <ul className="community-premium-list">
          <li>Read restricted & premium stories</li>
          <li>Premium badge on profile</li>
          <li>Support the community platform</li>
        </ul>
      </div>
    </main>
  );
}
