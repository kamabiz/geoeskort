import Link from 'next/link';
import { PUBLIC_CHAT_ROOMS, type PublicChatRoomKey } from '@/lib/community/chat-rooms';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';

type Props = {
  locale: Locale;
  active: PublicChatRoomKey;
  labels: {
    general: string;
    gay: string;
  };
};

export function ChatRoomTabs({ locale, active, labels }: Props) {
  const tabs: Array<{ key: PublicChatRoomKey; href: string; label: string; icon: string }> = [
    { key: 'general', href: localePath(locale, PUBLIC_CHAT_ROOMS.general.path), label: labels.general, icon: '💬' },
    { key: 'gay', href: localePath(locale, PUBLIC_CHAT_ROOMS.gay.path), label: labels.gay, icon: '🏳️‍🌈' },
  ];

  return (
    <nav className="chat-room__tabs" aria-label="ჩათის ოთახები">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={`chat-room__tab${active === tab.key ? ' is-active' : ''}`}
          aria-current={active === tab.key ? 'page' : undefined}
        >
          <span className="chat-room__tab-icon" aria-hidden>{tab.icon}</span>
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
