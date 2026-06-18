import Link from 'next/link';
import { loginUser } from '@/lib/community/actions';
import { isLocale } from '@/lib/i18n/config';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  return pageMetadata({ locale: raw as Locale, path: '/login/', title: 'Log in', description: 'Community login' });
}

export default async function LoginPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return null;
  const locale = raw as Locale;

  return (
    <main className="container community-page">
      <h1>Log in</h1>
      <form action={loginUser} className="community-form">
        <label>
          Username
          <input name="username" required autoComplete="username" />
        </label>
        <label>
          Password
          <input name="password" type="password" required autoComplete="current-password" />
        </label>
        <button type="submit" className="btn btn--primary">Log in</button>
      </form>
      <p>
        No account? <Link href={localePath(locale, '/register/')}>Register</Link>
      </p>
    </main>
  );
}
