import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="container static-page">
      <h1>404</h1>
      <p>გვერდი ვერ მოიძებნა.</p>
      <p>
        <Link href="/">მთავარი</Link> · <Link href="/blog/">ბლოგი</Link>
      </p>
    </main>
  );
}
