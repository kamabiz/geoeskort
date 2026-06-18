import Link from 'next/link';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';

type Props = {
  locale: Locale;
};

export function ForumSidebarExtras({ locale }: Props) {
  const cd = getCommunityDict(locale);

  const quickLinks = [
    { href: '/submit/', label: cd.home.actionSubmit },
    { href: '/conversationRoom/', label: cd.home.actionConversation },
    { href: '/questions/', label: cd.home.actionQuestions },
    { href: '/points/', label: `⭐ ${cd.nav.points}` },
  ];

  return (
    <aside className="forum-panel">
      <h3 className="forum-panel__title">{cd.home.sidebarQuickTitle}</h3>
      <ul className="forum-panel__links">
        {quickLinks.map((link) => (
          <li key={link.href}>
            <Link href={localePath(locale, link.href)}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
