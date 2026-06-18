import Link from 'next/link';
import { getCommunityDict } from '@/lib/i18n/community-dict';
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
  onlineMembers: Member[];
  variant?: 'default' | 'modern';
};

export function OnlineMembersSidebar({
  locale,
  onlineMembers,
  variant = 'default',
}: Props) {
  const cd = getCommunityDict(locale);
  const premiumMembers = onlineMembers.filter((m) => m.isPremium);

  if (variant === 'modern' && premiumMembers.length === 0) {
    return null;
  }

  const className = variant === 'modern' ? 'forum-panel forum-panel--live' : 'community-sidebar';
  const members = variant === 'modern' ? premiumMembers : onlineMembers;

  return (
    <aside className={className}>
      <h3 className="forum-panel__title">
        {variant === 'modern' ? `👑 ${cd.online.premiumOnline}` : cd.online.title}
      </h3>
      <p className="forum-panel__stats">
        {variant === 'modern'
          ? `${members.length} ${cd.online.active}`
          : `🟢 ${members.length} ${cd.online.active}`}
      </p>
      {members.length === 0 ? (
        <p className="forum-panel__empty">{cd.online.empty}</p>
      ) : (
        <ul className="forum-panel__users">
          {members.map((member) => (
            <li key={member.id}>
              <Link href={localePath(locale, `/u/${member.username}/`)}>
                <span className="forum-panel__avatar">
                  {member.avatar ? '🖼' : member.username[0]?.toUpperCase()}
                </span>
                <span className="forum-panel__name">{member.username}</span>
                {member.isPremium && <span className="forum-panel__badge">👑</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
