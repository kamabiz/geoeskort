import Link from 'next/link';
import { redirect } from 'next/navigation';
import { DatingProfileEditor } from '@/components/community/DatingProfileEditor';
import { getCurrentUser } from '@/lib/community/auth';
import { getDatingProfileByUserId } from '@/lib/community/dating';
import {
  addDatingPhoto,
  removeDatingPhoto,
  upsertDatingProfile,
} from '@/lib/community/dating-actions';
import { safeCommunity } from '@/lib/community/safe';
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
    path: '/user/dating/',
    title: cd.dating.editorTitle,
    description: cd.dating.editorLead,
  });
}

export default async function UserDatingPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return null;
  const locale = raw as Locale;
  const cd = getCommunityDict(locale);
  const user = await getCurrentUser();

  if (!user) {
    redirect(localePath(locale, '/login/'));
  }

  const profile = await safeCommunity(() => getDatingProfileByUserId(user.id), null);

  return (
    <main className="container community-page">
      <header className="community-page__header">
        <div>
          <h1>{cd.dating.editorTitle}</h1>
          <p className="community-page__lead">{cd.dating.editorLead}</p>
        </div>
        <Link href={localePath(locale, '/dating/')} className="btn btn--ghost">
          {cd.dating.backToBrowse}
        </Link>
      </header>

      <DatingProfileEditor
        profile={profile}
        upsertProfile={upsertDatingProfile}
        addPhoto={addDatingPhoto}
        removePhoto={removeDatingPhoto}
        messages={{
          save: cd.dating.save,
          presetCase: cd.dating.presetCase,
          presetCaseHint: cd.dating.presetCaseHint,
          bio: cd.dating.bio,
          bioPlaceholder: cd.dating.bioPlaceholder,
          bioHint: cd.dating.bioHint,
          isVisible: cd.dating.isVisible,
          photosTitle: cd.dating.photosTitle,
          photosLead: cd.dating.photosLead,
          photoUpload: cd.dating.photoUpload,
          photoUploadHint: cd.dating.photoUploadHint,
          photoRemove: cd.dating.photoRemove,
          presetLabels: cd.dating.presetLabels,
          errors: {
            loginRequired: cd.dating.errorLoginRequired,
            serviceUnavailable: cd.auth.errorServiceUnavailable,
            invalidPreset: cd.dating.errorInvalidPreset,
            bioTooShort: cd.dating.errorBioTooShort,
            photoRequired: cd.dating.errorPhotoRequired,
            invalidPhotoType: cd.dating.errorInvalidPhotoType,
            photoTooLarge: cd.dating.errorPhotoTooLarge,
            photoLimitReached: cd.dating.errorPhotoLimitReached,
            photoNotFound: cd.dating.errorPhotoNotFound,
            profileNotFound: cd.dating.errorProfileNotFound,
          },
          successes: {
            profileSaved: cd.dating.successProfileSaved,
            photoAdded: cd.dating.successPhotoAdded,
            photoRemoved: cd.dating.successPhotoRemoved,
          },
        }}
      />
    </main>
  );
}
