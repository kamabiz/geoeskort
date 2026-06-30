import { notFound, permanentRedirect } from 'next/navigation';
import { getCommunityPostViewPath } from '@/lib/community/categories';
import { getPostById } from '@/lib/community/posts';
import { safeCommunity } from '@/lib/community/safe';
import { isLocale } from '@/lib/i18n/config';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function LegacyQuestionViewRedirect({ params }: Props) {
  const { locale: raw, id } = await params;
  if (!isLocale(raw)) notFound();

  const post = await safeCommunity(() => getPostById(id), null);
  if (!post || post.status !== 'PUBLISHED') notFound();

  permanentRedirect(localePath(raw as Locale, getCommunityPostViewPath(post.category, post.slug)));
}
