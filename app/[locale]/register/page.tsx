import Link from 'next/link';
import { registerUser } from '@/lib/community/actions';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { isLocale } from '@/lib/i18n/config';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const cd = getCommunityDict(raw as Locale);
  return pageMetadata({ locale: raw as Locale, path: '/register/', title: cd.auth.register, description: cd.auth.register });
}

export default async function RegisterPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return null;
  const locale = raw as Locale;
  const cd = getCommunityDict(locale);

  return (
    <main className="container community-page">
      <h1>{cd.auth.register}</h1>
      <form action={registerUser} className="community-form">
        <label>
          {cd.auth.username}
          <input name="username" required minLength={3} autoComplete="username" />
        </label>
        <label>
          {cd.auth.email}
          <input name="email" type="email" autoComplete="email" />
        </label>
        <label>
          {cd.auth.password}
          <input name="password" type="password" required minLength={6} autoComplete="new-password" />
        </label>
        <button type="submit" className="btn btn--primary">{cd.auth.submitRegister}</button>
      </form>
      <p>
        {cd.auth.hasAccount} <Link href={localePath(locale, '/login/')}>{cd.auth.login}</Link>
      </p>
    </main>
  );
}
