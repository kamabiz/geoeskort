import Link from 'next/link';
import { AuthForm } from '@/components/community/AuthForm';
import { registerUser } from '@/lib/community/actions';
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
      <AuthForm
        action={registerUser}
        submitLabel={cd.auth.submitRegister}
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
          <input name="username" required minLength={3} autoComplete="username" pattern="[a-zA-Z0-9_]{3,24}" title="a-z, 0-9, _" />
        </label>
        <label>
          {cd.auth.email}
          <input name="email" type="email" autoComplete="email" />
        </label>
        <label>
          {cd.auth.password}
          <input name="password" type="password" required minLength={6} autoComplete="new-password" />
        </label>
        <label>
          {cd.auth.gender}
          <select name="gender" required defaultValue="nonBinary">
            <option value="female">{cd.auth.genderFemale}</option>
            <option value="male">{cd.auth.genderMale}</option>
            <option value="nonBinary">{cd.auth.genderNonBinary}</option>
          </select>
        </label>
      </AuthForm>
      <p>
        {cd.auth.hasAccount} <Link href={localePath(locale, '/login/')}>{cd.auth.login}</Link>
      </p>
    </main>
  );
}
