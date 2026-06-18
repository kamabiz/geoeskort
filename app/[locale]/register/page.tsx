import Link from 'next/link';
import { registerUser } from '@/lib/community/actions';
import { isLocale } from '@/lib/i18n/config';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  return pageMetadata({ locale: raw as Locale, path: '/register/', title: 'Register', description: 'Create a community account' });
}

export default async function RegisterPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return null;
  const locale = raw as Locale;

  return (
    <main className="container community-page">
      <h1>Register</h1>
      <form action={registerUser} className="community-form">
        <label>
          Username
          <input name="username" required minLength={3} autoComplete="username" />
        </label>
        <label>
          Email (optional)
          <input name="email" type="email" autoComplete="email" />
        </label>
        <label>
          Password
          <input name="password" type="password" required minLength={6} autoComplete="new-password" />
        </label>
        <button type="submit" className="btn btn--primary">Create account</button>
      </form>
      <p>
        Already have an account? <Link href={localePath(locale, '/login/')}>Log in</Link>
      </p>
    </main>
  );
}
