import Link from 'next/link';
import { ChatRoom } from '@/components/community/ChatRoom';
import { parseAvatarGender } from '@/lib/community/avatar';
import { getCurrentUser } from '@/lib/community/auth';
import { userHasPremiumAccess } from '@/lib/community/premium';
import { isPremiumEnabled } from '@/lib/community/premium-config';
import { prisma } from '@/lib/prisma';
import { safeCommunity } from '@/lib/community/safe';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { isLocale } from '@/lib/i18n/config';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';
import { pageMetadata } from '@/lib/seo';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ to?: string; gender?: string }>;
};

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const cd = getCommunityDict(raw as Locale);
  return pageMetadata({ locale: raw as Locale, path: '/messages/', title: cd.messages.title, description: cd.messages.lead });
}

export default async function MessagesPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  const { to, gender: rawGender } = await searchParams;
  if (!isLocale(raw)) return null;
  const locale = raw as Locale;
  const cd = getCommunityDict(locale);
  const user = await getCurrentUser();
  const genderFilter = parseAvatarGender(rawGender ?? '') ?? null;

  const peer = to
    ? await safeCommunity(
        () => prisma.user.findUnique({ where: { username: to.toLowerCase() } }),
        null,
      )
    : null;

  const users = await safeCommunity(
    () =>
      prisma.user.findMany({
        where: genderFilter ? { gender: genderFilter } : undefined,
        take: 20,
        orderBy: { lastActiveAt: 'desc' },
        select: { id: true, username: true, gender: true },
      }),
    [],
  );

  const withGender = (username: string) =>
    localePath(locale, `/messages/?to=${username}${genderFilter ? `&gender=${genderFilter}` : ''}`);
  const filterHref = (value: 'female' | 'male' | 'nonBinary' | null) =>
    localePath(locale, `/messages/${value ? `?gender=${value}` : ''}`);

  return (
    <main className="container community-page community-page--split">
      <aside className="community-sidebar">
        <h2>{cd.messages.startDm}</h2>
        <p className="community-sidebar__stats">
          {cd.common.search}:{' '}
          <Link href={filterHref(null)} className={genderFilter === null ? 'community-filter-link is-active' : 'community-filter-link'}>
            {cd.messages.filterAll}
          </Link>{' '}
          ·{' '}
          <Link href={filterHref('female')} className={genderFilter === 'female' ? 'community-filter-link is-active' : 'community-filter-link'}>
            {cd.messages.filterFemale}
          </Link>{' '}
          ·{' '}
          <Link href={filterHref('male')} className={genderFilter === 'male' ? 'community-filter-link is-active' : 'community-filter-link'}>
            {cd.messages.filterMale}
          </Link>{' '}
          ·{' '}
          <Link href={filterHref('nonBinary')} className={genderFilter === 'nonBinary' ? 'community-filter-link is-active' : 'community-filter-link'}>
            {cd.messages.filterNonBinary}
          </Link>
        </p>
        <ul className="community-sidebar__list community-sidebar__list--users">
          {users.map((u) => (
            <li key={u.id}>
              <Link href={withGender(u.username)}>
                @{u.username}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
      <div>
        {!user ? (
          <p>{cd.messages.loginRequired} <Link href={localePath(locale, '/login/')}>{cd.auth.login}</Link></p>
        ) : isPremiumEnabled() && !userHasPremiumAccess(user) ? (
          <div className="community-premium-lock">
            <p>{cd.messages.premiumRequired}</p>
            <Link href={localePath(locale, '/user/subscription/')} className="btn btn--primary">{cd.chat.premiumBtn}</Link>
          </div>
        ) : peer ? (
          <ChatRoom
            title={`${cd.messages.dmWith}${peer.username}`}
            recipientId={peer.id}
            peerId={user.id}
            labels={{
              send: cd.chat.send,
              placeholder: cd.chat.sendPlaceholder,
              loginRequired: cd.messages.loginRequired,
            }}
          />
        ) : (
          <p>{cd.messages.selectMember}</p>
        )}
      </div>
    </main>
  );
}
