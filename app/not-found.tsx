import Link from 'next/link';
import { localePath } from '@/lib/i18n/paths';
import { getDictionary } from '@/lib/i18n/get-dictionary';

export default function NotFound() {
  const dict = getDictionary('ka');
  return (
    <main className="container static-page">
      <h1>{dict.notFound.title}</h1>
      <p>{dict.notFound.desc}</p>
      <p>
        <Link href={localePath('ka', '/')}>{dict.notFound.home}</Link>
        {' · '}
        <Link href={localePath('ka', '/blog/')}>{dict.notFound.blog}</Link>
      </p>
    </main>
  );
}
