import Link from 'next/link';
import { ChatRoom } from '@/components/community/ChatRoom';
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
  searchParams: Promise<{ to?: string }>;
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
  const { to } = await searchParams;
  if (!isLocale(raw)) return null;
  const locale = raw as Locale;
  const cd = getCommunityDict(locale);
  const user = await getCurrentUser();

  const peer = to
    ? await safeCommunity(
        () => prisma.user.findUnique({ where: { username: to.toLowerCase() } }),
        null,
      )
    : null;

  const users = await safeCommunity(
    () => prisma.user.findMany({ take: 20, orderBy: { lastActiveAt: 'desc' }, select: { id: true, username: true } }),
    [],
  );

  return (
    <main className="container community-page community-page--split">
      <aside className="community-sidebar">
        <h2>{cd.messages.startDm}</h2>
        <ul className="community-sidebar__list community-sidebar__list--users">
          {users.map((u) => (
            <li key={u.id}>
              <Link href={localePath(locale, `/messages/?to=${u.username}`)}>@{u.username}</Link>
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
