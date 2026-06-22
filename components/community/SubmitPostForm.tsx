'use client';

import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import {
  STORY_CATEGORIES,
  STORY_CATEGORY_SLUGS,
  MODULE_CATEGORIES,
  getCommunityCategoryEmoji,
  getCommunityCategoryLabel,
  type SubmitModuleContext,
} from '@/lib/community/categories';
import { submitPost } from '@/lib/community/actions';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';

type Props = {
  locale: Locale;
  defaultCategory?: string;
  moduleContext?: SubmitModuleContext;
  cancelHref?: string;
  premiumOn?: boolean;
};

function PublishButton({ label, publishingLabel }: { label: string; publishingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn--primary" disabled={pending} aria-busy={pending}>
      {pending ? publishingLabel : label}
    </button>
  );
}

export function SubmitPostForm({
  locale,
  defaultCategory,
  moduleContext,
  cancelHref = '/history/',
  premiumOn = false,
}: Props) {
  const cd = getCommunityDict(locale);

  const lockedCategory =
    moduleContext === 'questions'
      ? MODULE_CATEGORIES['questions-advice'].slug
      : moduleContext === 'crush'
        ? MODULE_CATEGORIES['dating-crush'].slug
        : moduleContext === 'medical'
          ? MODULE_CATEGORIES.sexology.slug
          : undefined;

  const categories = lockedCategory
    ? [MODULE_CATEGORIES[lockedCategory as keyof typeof MODULE_CATEGORIES]]
    : STORY_CATEGORY_SLUGS.map((slug) => STORY_CATEGORIES[slug]);

  const initial =
    lockedCategory ??
    (defaultCategory && categories.some((c) => c.slug === defaultCategory)
      ? defaultCategory
      : categories[0].slug);

  const lockedMeta = lockedCategory
    ? {
        emoji: getCommunityCategoryEmoji(lockedCategory),
        label: getCommunityCategoryLabel(lockedCategory),
      }
    : null;

  return (
    <form action={submitPost} className="community-form">
      {moduleContext && <input type="hidden" name="moduleContext" value={moduleContext} />}
      {lockedCategory && <input type="hidden" name="category" value={lockedCategory} />}

      {lockedMeta && (
        <p className="community-form__module-cat" aria-live="polite">
          <span className="community-form__module-cat-emoji" aria-hidden>
            {lockedMeta.emoji}
          </span>
          {lockedMeta.label}
        </p>
      )}

      <label>
        {cd.submit.storyTitle}
        <input name="title" required minLength={5} maxLength={200} />
      </label>

      {!lockedCategory && (
        <label>
          {cd.submit.category}
          <select name="category" required defaultValue={initial}>
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.emoji} {cat.label}
              </option>
            ))}
          </select>
        </label>
      )}

      <label>
        {cd.submit.tags}
        <input name="tags" placeholder={cd.submit.tagsPlaceholder} />
      </label>
      <label>
        {cd.submit.body}
        <textarea name="body" required minLength={20} rows={12} placeholder={cd.submit.bodyPlaceholder} />
      </label>
      <label className="community-form__check">
        <input type="checkbox" name="anonymous" />
        {cd.submit.anonymous}
      </label>
      {premiumOn && (
        <label className="community-form__check">
          <input type="checkbox" name="isPremium" />
          {cd.submit.premiumOnly}
        </label>
      )}
      <div className="community-form__actions">
        <PublishButton label={cd.submit.publish} publishingLabel={cd.submit.publishing} />
        <Link href={localePath(locale, cancelHref)} className="btn btn--ghost">
          {cd.submit.cancel}
        </Link>
      </div>
    </form>
  );
}
