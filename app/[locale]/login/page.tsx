import Link from 'next/link';
import { AuthForm } from '@/components/community/AuthForm';
import { loginUser } from '@/lib/community/actions';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { isLocale } from '@/lib/i18n/config';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const cd = getCommunityDict(raw as Locale);
  return pageMetadata({ locale: raw as Locale, path: '/login/', title: cd.auth.login, description: cd.auth.login });
}

export default async function LoginPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return null;
  const locale = raw as Locale;
  const cd = getCommunityDict(locale);

  return (
    <main className="container community-page">
      <h1>{cd.auth.login}</h1>
      <AuthForm
        action={loginUser}
        submitLabel={cd.auth.submitLogin}
        errors={{
          invalidCredentials: cd.auth.errorInvalidCredentials,
          usernameTaken: cd.auth.errorUsernameTaken,
          usernameTooShort: cd.auth.errorUsernameTooShort,
          passwordTooShort: cd.auth.errorPasswordTooShort,
          invalidGender: cd.auth.errorInvalidGender,
          serviceUnavailable: cd.auth.errorServiceUnavailable,
        }}
      >
        <label>
          {cd.auth.username}
          <input name="username" required autoComplete="username" />
        </label>
        <label>
          {cd.auth.password}
          <input name="password" type="password" required autoComplete="current-password" />
        </label>
      </AuthForm>
      <p>
        {cd.auth.noAccount} <Link href={localePath(locale, '/register/')}>{cd.auth.register}</Link>
      </p>
    </main>
  );
}
