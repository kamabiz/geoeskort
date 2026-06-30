import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DatingProfileCard } from '@/components/community/DatingProfileCard';
import { getCurrentUser } from '@/lib/community/auth';
import { listDatingProfiles } from '@/lib/community/dating';
import { type DatingGenderBucket, parseDatingGenderBucket } from '@/lib/community/dating-presets';
import { safeCommunity } from '@/lib/community/safe';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { isLocale } from '@/lib/i18n/config';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';
import { pageMetadata } from '@/lib/seo';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ bucket?: string; page?: string }>;
};

export const dynamic = 'force-dynamic';

const BUCKETS: DatingGenderBucket[] = ['male', 'female', 'trans'];

export async function generateMetadata({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const cd = getCommunityDict(raw as Locale);
  return pageMetadata({
    locale: raw as Locale,
    path: '/dating/',
    title: cd.dating.title,
    description: cd.dating.lead,
  });
}

export default async function DatingPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  const { bucket: bucketRaw, page: pageRaw } = await searchParams;
  if (!isLocale(raw)) notFound();

  const locale = raw as Locale;
  const cd = getCommunityDict(locale);
  const user = await getCurrentUser();
  const bucket = parseDatingGenderBucket(bucketRaw ?? '') ?? 'male';
  const page = Math.max(1, parseInt(pageRaw || '1', 10) || 1);
  const limit = 12;
  const skip = (page - 1) * limit;

  const profiles = await safeCommunity(
    () =>
      listDatingProfiles({
        genderBucket: bucket,
        limit,
        skip,
        excludeUserId: user?.id,
      }),
    [],
  );

  const bucketLabels: Record<DatingGenderBucket, string> = {
    male: cd.dating.filterMale,
    female: cd.dating.filterFemale,
    trans: cd.dating.filterTrans,
  };

  return (
    <main className="container community-page">
      <div className="page-header community-page__header">
        <div>
          <h1>{cd.dating.title}</h1>
          <p className="community-page__lead">{cd.dating.lead}</p>
        </div>
        {user ? (
          <Link href={localePath(locale, '/user/dating/')} className="btn btn--primary">
            {cd.dating.editProfile}
          </Link>
        ) : (
          <Link href={localePath(locale, '/login/')} className="btn btn--primary">
            {cd.dating.loginToCreate}
          </Link>
        )}
      </div>

      <section className="dating-intro" aria-labelledby="dating-intro-title">
        <div>
          <h2 id="dating-intro-title">{cd.dating.introTitle}</h2>
          <p>{cd.dating.introBody}</p>
        </div>
        <ol className="dating-intro__steps">
          <li>{cd.dating.stepPhotos}</li>
          <li>{cd.dating.stepDetails}</li>
          <li>{cd.dating.stepBrowse}</li>
        </ol>
      </section>

      <div className="history-categories">
        {BUCKETS.map((item) => (
          <Link
            key={item}
            href={localePath(locale, `/dating/?bucket=${item}`)}
            className={`forum-chip${bucket === item ? ' is-active' : ''}`}
          >
            {bucketLabels[item]}
          </Link>
        ))}
      </div>

      <div className="dating-grid">
        {profiles.length === 0 ? (
          <div className="dating-empty">
            <p className="community-sidebar__empty">{cd.dating.noProfiles}</p>
            {user ? (
              <Link href={localePath(locale, '/user/dating/')} className="btn btn--ghost">
                {cd.dating.noProfilesHint}
              </Link>
            ) : (
              <Link href={localePath(locale, '/login/')} className="btn btn--ghost">
                {cd.dating.loginToCreate}
              </Link>
            )}
          </div>
        ) : (
          profiles.map((profile) => (
            <DatingProfileCard
              key={profile.id}
              profile={profile}
              locale={locale}
              messages={{
                presetLabels: cd.dating.presetLabels,
                viewProfile: cd.dating.viewProfile,
              }}
            />
          ))
        )}
      </div>

      <div className="community-pagination">
        {page > 1 && (
          <Link
            href={localePath(locale, `/dating/?bucket=${bucket}&page=${page - 1}`)}
            className="btn btn--ghost"
          >
            {cd.common.previous}
          </Link>
        )}
        {profiles.length === limit && (
          <Link
            href={localePath(locale, `/dating/?bucket=${bucket}&page=${page + 1}`)}
            className="btn btn--ghost"
          >
            {cd.common.next}
          </Link>
        )}
      </div>
    </main>
  );
}
