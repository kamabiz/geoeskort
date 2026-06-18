import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'კონტაქტი',
  description: 'GEOESKORT კონტაქტი — ინფორმაციული პორტალი. პროფილებისთვის KAMA.BIZ.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <main className="container static-page">
      <h1>კონტაქტი</h1>
      <p>GEOESKORT არის ინფორმაციული ბლოგი nightlife და escort თემებზე საქართველოში.</p>
      <p>
        <strong>ელ-ფოსტა:</strong>{' '}
        <a href="mailto:kama.escorts@proton.me">kama.escorts@proton.me</a>
      </p>
      <p>
        escort პროფილების სანახავად და დაკავშირებისთვის გადადით{' '}
        <a href="https://kama.biz" rel="noopener noreferrer">
          KAMA.BIZ
        </a>
        -ზე.
      </p>
    </main>
  );
}
