'use client';

import Link from 'next/link';
import { CommunityAvatar } from '@/components/community/CommunityAvatar';
import type { DatingProfileView } from '@/lib/community/dating';
import type { DatingPresetCase } from '@/lib/community/dating-presets';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';

type Messages = {
  presetLabels: Record<DatingPresetCase, string>;
  viewProfile: string;
};

type Props = {
  profile: DatingProfileView;
  locale: Locale;
  messages: Messages;
};

export function DatingProfileCard({ profile, locale, messages }: Props) {
  const cover = profile.photos[0]?.url ?? profile.avatar;
  const presetLabel = messages.presetLabels[profile.presetCase] ?? profile.presetCase;

  return (
    <article className="dating-card">
      <div className="dating-card__media">
        {cover ? (
          <img
            src={cover}
            alt={`@${profile.username}`}
            className="dating-card__image"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="dating-card__placeholder">
            <CommunityAvatar username={profile.username} avatar={profile.avatar} size="lg" />
          </div>
        )}
        {profile.photos.length > 1 && (
          <span className="dating-card__photo-count" aria-hidden>
            {profile.photos.length}
          </span>
        )}
      </div>
      <div className="dating-card__body">
        <div className="dating-card__header">
          <CommunityAvatar username={profile.username} avatar={profile.avatar} size="sm" />
          <div>
            <h2 className="dating-card__name">@{profile.username}</h2>
            <p className="dating-card__preset">{presetLabel}</p>
          </div>
        </div>
        <p className="dating-card__bio">{profile.bio}</p>
        <Link
          href={localePath(locale, `/u/${profile.username}/`)}
          className="btn btn--ghost dating-card__link"
        >
          {messages.viewProfile}
        </Link>
      </div>
    </article>
  );
}
