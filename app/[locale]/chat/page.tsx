import Link from 'next/link';
import { ChatRoom } from '@/components/community/ChatRoom';
import { getCurrentUser } from '@/lib/community/auth';
import { userHasPremiumAccess } from '@/lib/community/premium';
import { isPremiumEnabled } from '@/lib/community/premium-config';
import { SOCKET_CONFIG } from '@/lib/community/socket-config';
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
  return pageMetadata({ locale: raw as Locale, path: '/chat/', title: cd.chat.title, description: cd.chat.lead });
}

export default async function ChatPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return null;
  const locale = raw as Locale;
  const cd = getCommunityDict(locale);
  const user = await getCurrentUser();
  const premiumLocked = Boolean(user && isPremiumEnabled() && !userHasPremiumAccess(user));

  return (
    <main className="container community-page">
      <div className="page-header">
        <h1>{cd.chat.title}</h1>
        <p className="community-page__lead">{cd.chat.lead}</p>
      </div>
      {premiumLocked ? (
        <div className="community-premium-lock">
          <p>{cd.chat.premiumRequired}</p>
          <Link href={localePath(locale, '/user/subscription/')} className="btn btn--primary">{cd.chat.premiumBtn}</Link>
        </div>
      ) : (
        <ChatRoom
          title={cd.chat.title}
          roomId={SOCKET_CONFIG.liveRoomId}
          guestMode={!user}
          registerHref={localePath(locale, '/register/')}
          loginHref={localePath(locale, '/login/')}
          labels={{
            send: cd.chat.send,
            placeholder: cd.chat.sendPlaceholder,
            loginRequired: cd.chat.loginRequired,
          }}
          guestLabels={{
            limitTitle: cd.chat.guestLimitTitle,
            limitBody: cd.chat.guestLimitBody,
            register: cd.chat.guestRegister,
            login: cd.chat.guestLogin,
            close: cd.chat.guestLimitClose,
          }}
        />
      )}
    </main>
  );
}
