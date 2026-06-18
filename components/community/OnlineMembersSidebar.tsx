import Link from 'next/link';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';

type Member = {
  id: string;
  username: string;
  avatar: string | null;
  isPremium: boolean;
};

type Props = {
  locale: Locale;
  totalMembers: number;
  onlineCount: number;
  onlineMembers: Member[];
};

export function OnlineMembersSidebar({ locale, totalMembers, onlineCount, onlineMembers }: Props) {
  return (
    <aside className="community-sidebar">
      <h3 className="community-sidebar__title">Members online</h3>
      <p className="community-sidebar__stats">
        🟢 {onlineCount} online · {totalMembers} members
      </p>
      <ul className="community-sidebar__list community-sidebar__list--users">
        {onlineMembers.map((member) => (
          <li key={member.id}>
            <Link href={localePath(locale, `/u/${member.username}/`)}>
              <span className="community-avatar">{member.avatar ? '🖼' : member.username[0]?.toUpperCase()}</span>
              <span>{member.username}</span>
              {member.isPremium && <span className="community-card__premium">Premium</span>}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
