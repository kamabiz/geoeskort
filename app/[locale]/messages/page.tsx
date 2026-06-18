import Link from 'next/link';
import { ChatRoom } from '@/components/community/ChatRoom';
import { getCurrentUser } from '@/lib/community/auth';
import { prisma } from '@/lib/prisma';
import { safeCommunity } from '@/lib/community/safe';
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
  return pageMetadata({
    locale: raw as Locale,
    path: '/messages/',
    title: 'Direct messages',
    description: 'Private 1:1 messages',
  });
}

export default async function MessagesPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  const { to } = await searchParams;
  if (!isLocale(raw)) return null;
  const locale = raw as Locale;

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
        <h2>Start a DM</h2>
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
          <p>Please <Link href={localePath(locale, '/login/')}>log in</Link> to send direct messages.</p>
        ) : peer ? (
          <ChatRoom
            title={`DM with @${peer.username}`}
            recipientId={peer.id}
            peerId={user.id}
          />
        ) : (
          <p>Select a member to start a conversation.</p>
        )}
      </div>
    </main>
  );
}
