import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ProfileSettingsForms } from '@/components/community/ProfileSettingsForms';
import { getCurrentUser } from '@/lib/community/auth';
import { parseAvatarGender } from '@/lib/community/avatar';
import {
  updateProfileAvatar,
  updateProfileEmail,
  updateProfilePassword,
  updateProfileUsername,
} from '@/lib/community/profile-actions';
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
  return pageMetadata({
    locale: raw as Locale,
    path: '/user/settings/',
    title: cd.settings.title,
    description: cd.settings.lead,
  });
}

export default async function UserSettingsPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return null;
  const locale = raw as Locale;
  const cd = getCommunityDict(locale);
  const user = await getCurrentUser();

  if (!user) {
    redirect(localePath(locale, '/login/'));
  }

  const gender = parseAvatarGender(user.gender ?? '');

  return (
    <main className="container community-page">
      <header className="community-page__header">
        <div>
          <h1>{cd.settings.title}</h1>
          <p className="community-page__lead">{cd.settings.lead}</p>
        </div>
        <Link href={localePath(locale, `/u/${user.username}/`)} className="btn btn--ghost">
          {cd.settings.backToProfile}
        </Link>
      </header>

      <ProfileSettingsForms
        username={user.username}
        email={user.email}
        avatar={user.avatar}
        gender={gender}
        updateUsername={updateProfileUsername}
        updateEmail={updateProfileEmail}
        updatePassword={updateProfilePassword}
        updateAvatar={updateProfileAvatar}
        messages={{
          save: cd.settings.save,
          username: cd.auth.username,
          email: cd.auth.email,
          emailOptional: cd.settings.emailOptional,
          currentPassword: cd.settings.currentPassword,
          newPassword: cd.settings.newPassword,
          confirmPassword: cd.settings.confirmPassword,
          avatarTitle: cd.settings.avatarTitle,
          avatarUpload: cd.settings.avatarUpload,
          avatarUploadHint: cd.settings.avatarUploadHint,
          gender: cd.auth.gender,
          genderFemale: cd.auth.genderFemale,
          genderMale: cd.auth.genderMale,
          genderNonBinary: cd.auth.genderNonBinary,
          errors: {
            loginRequired: cd.settings.errorLoginRequired,
            serviceUnavailable: cd.auth.errorServiceUnavailable,
            usernameTooShort: cd.auth.errorUsernameTooShort,
            usernameTaken: cd.auth.errorUsernameTaken,
            invalidEmail: cd.settings.errorInvalidEmail,
            emailTaken: cd.settings.errorEmailTaken,
            invalidCurrentPassword: cd.settings.errorInvalidCurrentPassword,
            passwordTooShort: cd.auth.errorPasswordTooShort,
            passwordMismatch: cd.settings.errorPasswordMismatch,
            noPasswordSet: cd.settings.errorNoPasswordSet,
            invalidAvatarType: cd.settings.errorInvalidAvatarType,
            avatarTooLarge: cd.settings.errorAvatarTooLarge,
            avatarRequired: cd.settings.errorAvatarRequired,
          },
          successes: {
            usernameUpdated: cd.settings.successUsername,
            emailUpdated: cd.settings.successEmail,
            passwordUpdated: cd.settings.successPassword,
            avatarUpdated: cd.settings.successAvatar,
          },
        }}
      />
    </main>
  );
}
