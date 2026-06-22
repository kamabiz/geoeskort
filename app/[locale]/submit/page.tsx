import Link from 'next/link';
import { SubmitPostForm } from '@/components/community/SubmitPostForm';
import { getCurrentUser } from '@/lib/community/auth';
import { type SubmitModuleContext, isSubmitModuleContext } from '@/lib/community/categories';
import { isPremiumEnabled } from '@/lib/community/premium-config';
import { getCommunityDict } from '@/lib/i18n/community-dict';
import { isLocale } from '@/lib/i18n/config';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';
import { pageMetadata } from '@/lib/seo';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ module?: string }>;
};

const MODULE_CANCEL: Record<SubmitModuleContext, string> = {
  questions: '/questions/',
  crush: '/crush/',
  medical: '/medical/',
};

export async function generateMetadata({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const cd = getCommunityDict(raw as Locale);
  return pageMetadata({ locale: raw as Locale, path: '/submit/', title: cd.submit.title, description: cd.submit.lead });
}

export default async function SubmitPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  const { module: moduleRaw } = await searchParams;
  if (!isLocale(raw)) return null;
  const locale = raw as Locale;
  const cd = getCommunityDict(locale);
  const user = await getCurrentUser();

  const moduleKey = moduleRaw?.replace(/\/+$/, '');
  const moduleContext = moduleKey && isSubmitModuleContext(moduleKey) ? moduleKey : undefined;
  const cancelHref = moduleContext ? MODULE_CANCEL[moduleContext] : '/history/';

  return (
    <main className="container community-page">
      <div className="page-header community-page__header">
        <div>
          <h1>{cd.submit.title}</h1>
          <p className="community-page__lead">{cd.submit.lead}</p>
          {!user && <p className="history-tags-note">{cd.submit.loginRequired}</p>}
        </div>
        <Link href={localePath(locale, cancelHref)} className="btn btn--ghost">
          {cd.post.back}
        </Link>
      </div>
      <SubmitPostForm
        locale={locale}
        moduleContext={moduleContext}
        cancelHref={cancelHref}
        premiumOn={isPremiumEnabled()}
      />
    </main>
  );
}
