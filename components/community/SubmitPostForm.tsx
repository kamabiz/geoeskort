import Link from 'next/link';
import { COMMUNITY_CATEGORY_SLUGS, COMMUNITY_CATEGORIES } from '@/lib/community/categories';
import { submitPost } from '@/lib/community/actions';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';

type Props = { locale: Locale };

export function SubmitPostForm({ locale }: Props) {
  return (
    <form action={submitPost} className="community-form">
      <label>
        Title
        <input name="title" required minLength={5} maxLength={200} placeholder="Story title" />
      </label>
      <label>
        Category
        <select name="category" required defaultValue={COMMUNITY_CATEGORY_SLUGS[0]}>
          {COMMUNITY_CATEGORY_SLUGS.map((slug) => (
            <option key={slug} value={slug}>
              {COMMUNITY_CATEGORIES[slug].emoji} {COMMUNITY_CATEGORIES[slug].label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Tags (comma-separated)
        <input name="tags" placeholder="romance, first-time" />
      </label>
      <label>
        Story body (Markdown supported)
        <textarea name="body" required minLength={20} rows={12} placeholder="Write your story..." />
      </label>
      <label className="community-form__check">
        <input type="checkbox" name="anonymous" />
        Post anonymously
      </label>
      <label className="community-form__check">
        <input type="checkbox" name="isPremium" />
        Premium-only story
      </label>
      <div className="community-form__actions">
        <button type="submit" className="btn btn--primary">Publish story</button>
        <Link href={localePath(locale, '/')} className="btn btn--ghost">Cancel</Link>
      </div>
    </form>
  );
}
