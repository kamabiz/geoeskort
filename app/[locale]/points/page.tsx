import Link from 'next/link';
import { isLocale } from '@/lib/i18n/config';
import { localePath } from '@/lib/i18n/paths';
import type { Locale } from '@/lib/i18n/types';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  return pageMetadata({ locale: raw as Locale, path: '/points/', title: 'Points & karma', description: 'How community points work' });
}

export default async function PointsPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return null;
  const locale = raw as Locale;

  return (
    <main className="container community-page">
      <h1>Points & karma</h1>
      <p>Earn points by participating in the community:</p>
      <ul className="community-rules">
        <li><strong>+10</strong> — publish a story</li>
        <li><strong>+2</strong> — receive a comment on your story</li>
        <li><strong>+1</strong> — receive an upvote on your story</li>
        <li><strong>+1</strong> — receive an upvote on your comment</li>
      </ul>
      <Link href={localePath(locale, '/leaderboard/')} className="btn btn--primary">View leaderboard</Link>
    </main>
  );
}
